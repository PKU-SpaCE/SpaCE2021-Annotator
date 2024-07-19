# 数据汇总

import json
import os
import re
import numpy as np


def read_name(file_name):
    # print(file_name)
    the_r = re.compile(r'空间关系理解-(\d+)-\[标注\]-([^\]]+)--(\d+-\d+)\.json')
    the_m = re.match(the_r, file_name)
    if the_m:
        the_g = the_m.groups()
        the_o = {
            'file_id': the_g[0],
            'worker': the_g[1],
            'timeString': the_g[2]
        }
        return the_o
    else:
        return None


def load_data_of_files_in(dict_path):
    file_list = os.listdir(dict_path)
    files = []
    for file_name in file_list:
        if read_name(file_name):
            name_meta = read_name(file_name)
            file_path = os.path.join(dict_path, file_name)
            with open(file_path, 'r') as f:
                s = f.read()
            data = json.loads(s)
            # print(data)
            file = {
                "fileName": file_name,
                "filePath": file_path,
                'file_id': name_meta['file_id'],
                'worker': name_meta['worker'],
                'timeString': name_meta['timeString'],
                "data": data
            }
            files.append(file)
    # end_for
    return files


#
# judgeCorrection
map_judge_correction = {
    -1: '未处理',
    0: '难以判断',
    1: '不成立',
    2: '成立',
    4: '勉强成立'
}
# judgeType
map_judge_type = {
    -1: '未处理',
    0: '难以判断',
    1: '（旧）不宜搭配',
    2: '（旧）语义冲突',
    3: '成立，语义变化不大',
    4: '成立，语义变化大',
    6: '',
    7: '',
}
map_detail = {
    True: 1,
    False: 0,
    None: -1,
}
nl = '\n'
tl = '\t'
#
#
#
example_worker = {
    '姓名': '',
    '标注了的文件': [],
}
example_doc = {
    '文件id': '',
    '标注者1': '',
    '标注者2': '',
    '原句数量': '',
    '替换句数量': '',
}
example_case = {
    '文件id': -1,
    '标注者1': '',
    '标注者2': '',
    '句子编号': -1,
    '句子内容': '',
    '标注者1初判断': '',
    '标注者2初判断': '',
    '标注者1细节': {},
    '标注者2细节': {},
}
example_detail = {
    '存在搭配问题': False,
    '存在语义问题': False,
    '存在常识问题': False,
    '存在上下文问题': False,
    '存在其他问题': False,
    '存在的搭配问题细节': ['', ''],
    '存在的语义问题细节': ['', ''],
    '存在的常识问题细节': ['', ''],
    '存在的上下文问题细节': ['', ''],
    '存在的其他问题细节': [''],
}
#
#
#


def dict_list_2_table_list(dict_list):
    table_list = []
    heads = []
    for _k in dict_list[0].keys():
        heads.append(_k)
    table_list.append(heads)
    for dic in dict_list:
        values = []
        for _v in dic.values():
            values.append(_v)
        table_list.append(values)
    return table_list


# 新程序
def analyze_pair(data_files, output_path_json, output_path_table):
    doc_sum = {
        '文件总数量': 0,
        '单人标注文件数量': 0,
        '可比文件对数量': 0,
        '替换句总数': 0,
        '替换句可比较的总数': 0,
        '极严一致数': 0,
        '较严一致数': 0,
        '宽松一致数': 0,
    }
    #
    pair_dict = {}
    for data_file_case in data_files:
        if data_file_case['file_id'] in pair_dict:
            pair_dict[data_file_case['file_id']].append(data_file_case)
        else:
            pair_dict[data_file_case['file_id']] = [data_file_case]
    #
    different_sentences = []
    doc_reports = []
    cases = []
    for pair_id in pair_dict:
        if len(pair_dict[pair_id]) < 2:
            doc_sum['文件总数量'] += 1
            doc_sum['单人标注文件数量'] += 1
            continue
        doc_sum['文件总数量'] += 2
        doc_sum['可比文件对数量'] += 1
        data_file_case_a = pair_dict[pair_id][0]
        data_file_case_b = pair_dict[pair_id][1]
        doc_report = {
            '文件id': pair_id,
            '标注者1': data_file_case_a['worker'],
            '标注者2': data_file_case_b['worker'],
            '标注者1时间戳': data_file_case_a['timeString'],
            '标注者2时间戳': data_file_case_b['timeString'],
            '原句数量': 0,
            '替换词数量': 0,
            '替换句数量': 0,
            '标注者1丢弃原句数量': 0,
            '标注者2丢弃原句数量': 0,
            '原句丢弃不一致数量': 0,
        }
        data_case_a = data_file_case_a['data']
        data_case_b = data_file_case_b['data']
        #
        #
        local_cases = []
        case_id = 0
        for ix in range(len(data_case_a['data'])):
            data_item_a = data_case_a['data'][ix]
            data_item_b = data_case_b['data'][ix]
            #
            sentence_frags = []
            for frag in data_item_a['originalSentence']:
                sentence_frags.append(frag['word'])
            #
            doc_report['原句数量'] += 1
            doc_report['替换词数量'] += len(data_item_a['clusters'])
            doc_report['替换句数量'] += len(data_item_a['changesObjects'])
            #
            doc_sum['替换句可比较的总数'] += len(data_item_a['changesObjects'])
            #
            oer_a = data_item_a['originalError']
            oer_b = data_item_b['originalError']
            if oer_a:
                doc_report['标注者1丢弃原句数量'] += 1
            if oer_b:
                doc_report['标注者2丢弃原句数量'] += 1
            #
            if oer_a != oer_b:
                doc_report['原句丢弃不一致数量'] += 1
            # else:
            for jx in range(len(data_item_a['changesObjects'])):
                changes_obj_a = data_item_a['changesObjects'][jx]
                changes_obj_b = data_item_b['changesObjects'][jx]
                local_sentence_frags = json.loads(json.dumps(sentence_frags))
                for change in changes_obj_a['changes']:
                    local_sentence_frags[change['idx']] = f"【【{local_sentence_frags[change['idx']]}→{change['to']}】】"
                #
                reason_a = changes_obj_a['whyNot']
                reason_b = changes_obj_b['whyNot']
                if 'isChangShiError' not in reason_a:
                    reason_a['isChangShiError'] = None
                    reason_a['text_4_1'] = ''
                    reason_a['text_4_2'] = ''
                if 'isChangShiError' not in reason_b:
                    reason_b['isChangShiError'] = None
                    reason_b['text_4_1'] = ''
                    reason_b['text_4_2'] = ''
                if 'isYuJingError' not in reason_a:
                    reason_a['isYuJingError'] = None
                    reason_a['text_5_1'] = ''
                    reason_a['text_5_2'] = ''
                if 'isYuJingError' not in reason_b:
                    reason_b['isYuJingError'] = None
                    reason_b['text_5_1'] = ''
                    reason_b['text_5_2'] = ''
                detail_a = (map_detail[reason_a['isDaPeiBuDang']], map_detail[reason_a['isYuYiChongTu']],
                            map_detail[reason_a['isQiTa']],
                            map_detail[reason_a['isChangShiError']], map_detail[reason_a['isYuJingError']])
                detail_b = (map_detail[reason_b['isDaPeiBuDang']], map_detail[reason_b['isYuYiChongTu']],
                            map_detail[reason_b['isQiTa']],
                            map_detail[reason_b['isChangShiError']], map_detail[reason_b['isYuJingError']])
                #
                case = {
                    '文件id': doc_report['文件id'],
                    '批次id': data_item_a['batchId'],
                    '原句id': data_item_a['itemId'],
                    '替换词序号': changes_obj_a['clusterId'],
                    '替换句序号': case_id,
                    '标注者1': doc_report['标注者1'],
                    '标注者2': doc_report['标注者2'],
                    '标注者1时间戳': doc_report['标注者1时间戳'],
                    '标注者2时间戳': doc_report['标注者2时间戳'],
                    '标注者1已弃用原句': data_item_a['dropped'],
                    '标注者2已弃用原句': data_item_b['dropped'],
                    '标注者1已替换词': changes_obj_a['dropped'],
                    '标注者2已替换词': changes_obj_b['dropped'],
                    '句子内容': ''.join(local_sentence_frags),
                    '标注者1初判断': changes_obj_a['judgeCorrection'],
                    '标注者2初判断': changes_obj_b['judgeCorrection'],
                    '两位标注者初判断元组': (changes_obj_a['judgeCorrection'], changes_obj_b['judgeCorrection']),
                    '标注者1判断类型': changes_obj_a['judgeType'],
                    '标注者2判断类型': changes_obj_b['judgeType'],
                    '标注者1粗细节': detail_a,
                    '标注者2粗细节': detail_b,
                    '标注者1细节': reason_a,
                    '标注者2细节': reason_b,
                }
                local_cases.append(case)
                cases.append(case)
                case_id += 1
            #
        #
        # print(local_cases)
        judge_pair_dict = {}
        sum_n = 0
        sum_value_n = 0
        for case in local_cases:
            tt = (map_judge_correction[case['两位标注者初判断元组'][0]], map_judge_correction[case['两位标注者初判断元组'][1]])
            ttt = tuple(set(tt))
            if ttt in judge_pair_dict:
                judge_pair_dict[ttt] += 1
            else:
                judge_pair_dict[ttt] = 1
            sum_n += 1
            if len(ttt) == 1:
                if not (ttt[0] == '未处理' or ttt[0] == '难以判断'):
                    sum_value_n += 1
            elif len(ttt) == 2:
                if not (ttt[0] == '未处理' or ttt[1] == '未处理' or ttt[0] == '难以判断' or ttt[1] == '难以判断'):
                    sum_value_n += 1
            #
        #
        uuu_list = []
        # print('')
        # print(judge_pair_dict)
        doc_report['详情'] = judge_pair_dict
        # print('极严一致占比')
        for k, v in judge_pair_dict.items():
            if len(k) == 1:
                kk = f"都选择了「{k[0]}」"
                # print(f"{kk}：{v}/{sum_n} = {v/sum_n}")
                uuu = ('极严一致', kk, sum_n, v, v/sum_n, '极严')
                uuu_list.append(uuu)
                doc_sum['极严一致数'] += v
        # print('极严不一致占比')
        for k, v in judge_pair_dict.items():
            if len(k) == 2:
                kk = f"分别选择「{k[0]}、{k[1]}」"
                # print(f"{kk}：{v}/{sum_n} = {v/sum_n}")
                uuu = ('极严不一致', kk, sum_n, v, v/sum_n, '极严')
                uuu_list.append(uuu)
        # print('较严一致占比')
        for k, v in judge_pair_dict.items():
            if len(k) == 1:
                kk = f"都选择了「{k[0]}」"
                if not (k[0] == '未处理' or k[0] == '难以判断'):
                    # print(f"{kk}：{v}/{sum_value_n} = {v/sum_value_n}")
                    uuu = ('较严一致', kk, sum_value_n, v, v/sum_value_n, '较严')
                    uuu_list.append(uuu)
                    doc_sum['较严一致数'] += v
                    uuu = ('宽松一致', kk, sum_value_n, v, v/sum_value_n, '宽松')
                    uuu_list.append(uuu)
                    doc_sum['宽松一致数'] += v
        # print('较严不一致占比')
        for k, v in judge_pair_dict.items():
            if len(k) == 2:
                kk = f"分别选择「{k[0]}、{k[1]}」"
                if not (k[0] == '未处理' or k[1] == '未处理' or k[0] == '难以判断' or k[1] == '难以判断'):
                    # print(f"{kk}：{v}/{sum_value_n} = {v/sum_value_n}")
                    uuu = ('较严不一致', kk, sum_value_n, v, v/sum_value_n, '较严')
                    uuu_list.append(uuu)
                    if (k[0] == '成立' and k[1] == '不成立') or (k[0] == '不成立' and k[1] == '成立'):
                        uuu = ('宽松不一致', kk, sum_value_n, v, v/sum_value_n, '宽松')
                        uuu_list.append(uuu)
                    else:
                        uuu = ('宽松一致', kk, sum_value_n, v, v/sum_value_n, '宽松')
                        uuu_list.append(uuu)
                        doc_sum['宽松一致数'] += v
        dict_of_happy = {
            '极严总数': 0,
            '极严一致': 0,
            '极严不一致': 0,
            '较严总数': 0,
            '宽松总数': 0,
            '较严一致': 0,
            '较严不一致': 0,
            '宽松不一致': 0,
            '宽松一致': 0,
            '极严一致率': 0,
            '较严一致率': 0,
            '宽松一致率': 0,
        }
        for uuu in uuu_list:
            # print(uuu)
            if uuu[5] == '极严':
                dict_of_happy['极严总数'] = uuu[2]
            elif uuu[5] == '较严' or uuu[5] == '宽松':
                dict_of_happy['较严总数'] = uuu[2]
                dict_of_happy['宽松总数'] = uuu[2]
            if uuu[0] in dict_of_happy:
                dict_of_happy[uuu[0]] += uuu[3]
            else:
                dict_of_happy[uuu[0]] = uuu[3]
        dict_of_happy['极严一致率'] = dict_of_happy['极严一致'] / dict_of_happy['极严总数']
        dict_of_happy['较严一致率'] = dict_of_happy['较严一致'] / dict_of_happy['较严总数']
        dict_of_happy['宽松一致率'] = dict_of_happy['宽松一致'] / dict_of_happy['宽松总数']
        # print(dict_of_happy)
        doc_report['统计'] = dict_of_happy
        doc_reports.append(doc_report)
    #
    # print(cases)
    with open(output_path_table, 'w', encoding='utf-8') as f:
        for k in cases[0].keys():
            f.write(f"{k}{tl}")
        f.write(f"{nl}")
        for case in cases:
            for k, v in case.items():
                f.write(f"{v}{tl}")
            f.write(f"{nl}")
        pass
    #
    with open(output_path_json, 'w', encoding='utf-8') as f:
        # f.write(json.dumps(dict_list_2_table_list(cases), ensure_ascii=False, indent=2))
        f.write(json.dumps(dict_list_2_table_list(cases), ensure_ascii=False))
    #
    #
    doc_reports.sort(key=lambda x: x['统计']['宽松一致率'])
    #
    l1 = []
    l2 = []
    l3 = []
    for report in doc_reports:
        l1.append(report['统计']['极严一致率'])
        l2.append(report['统计']['较严一致率'])
        l3.append(report['统计']['宽松一致率'])
    #
    #
    print('')
    print('### 总览')
    print('')
    #
    for k, v in doc_sum.items():
        print(f"{k}：{v}")
    #
    print('')
    np_l1 = np.array(l1)
    np_l2 = np.array(l2)
    np_l3 = np.array(l3)
    print(f"极严一致率（将「弃用」和「难以判断」算在内计算的一致率。）{nl}　　平均数：{np_l1.mean()}，标准差：{np_l1.std()}")
    print(f"较严一致率（将「弃用」和「难以判断」排除后计算的一致率。）{nl}　　平均数：{np_l2.mean()}，标准差：{np_l2.std()}")
    print(f"宽松一致率（将「弃用」和「难以判断」排除后，仅将「成立x不成立」视为不一致计算的一致率。）{nl}　　平均数：{np_l3.mean()}，标准差：{np_l3.std()}")
    #
    print('')
    print('### 各文件详情')
    for report in doc_reports:
        print('')
        for k, v in report.items():
            if k != '统计':
                print(f"{k}：{v}")
            elif k == '统计':
                for kr, vr in v.items():
                    print(f"　　{kr}：{vr}")
                pass
    #
    #


if __name__ == "__main__":
    dictPath = '/Users/sunch/Desktop/所有数据/第3批回收文件'
    outputPathJson = '/Users/sunch/Desktop/所有数据/第3批回收文件数据.table.json'
    outputPathTable = '/Users/sunch/Desktop/所有数据/第3批回收文件数据.txt'
    dataFiles = load_data_of_files_in(dictPath)
    analyze_pair(dataFiles, outputPathJson, outputPathTable)
    dictPath = '/Users/sunch/Desktop/所有数据/第2批回收文件'
    outputPathJson = '/Users/sunch/Desktop/所有数据/第2批回收文件数据.table.json'
    outputPathTable = '/Users/sunch/Desktop/所有数据/第2批回收文件数据.txt'
    dataFiles = load_data_of_files_in(dictPath)
    analyze_pair(dataFiles, outputPathJson, outputPathTable)
    dictPath = '/Users/sunch/Desktop/所有数据/第1批回收文件'
    outputPathJson = '/Users/sunch/Desktop/所有数据/第1批回收文件数据.table.json'
    outputPathTable = '/Users/sunch/Desktop/所有数据/第1批回收文件数据.txt'
    dataFiles = load_data_of_files_in(dictPath)
    analyze_pair(dataFiles, outputPathJson, outputPathTable)
    dictPath = '/Users/sunch/Desktop/全部数据'
    outputPathJson = '/Users/sunch/Desktop/所有数据/全部数据.table.json'
    outputPathTable = '/Users/sunch/Desktop/所有数据/全部数据.txt'
    dataFiles = load_data_of_files_in(dictPath)
    analyze_pair(dataFiles, outputPathJson, outputPathTable)
