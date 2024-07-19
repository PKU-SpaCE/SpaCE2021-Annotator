

// judgeCorrection
var map_judge_correction = {
    '-1': '未处理',
    '0': '难以判断',
    '1': '不成立',
    '2': '成立',
    '4': '勉强成立'
};
// judgeType
var map_judge_type = {
    '-1': '未处理',
    '0': '难以判断',
    '1': '（旧）不宜搭配',
    '2': '（旧）语义冲突',
    '3': '成立，语义变化不大',
    '4': '成立，语义变化大',
    '6': '',
    '7': '',
};
var map_detail = {
    'true': 1,
    'false': 0,
    'null': -1,
};


function dealWithWorkers(data) {
    let workers_works = {};
    let all_works = {
        origins: new Set(),
        clusters: new Set(),
        clusters_all: new Set(),
        items: new Set(),
        items_all: new Set(),
    };
    for (let da of data) {
        if (!(da.标注者 in workers_works)) {
            workers_works[da.标注者] = {
                origins: new Set(),
                clusters: new Set(),
                clusters_all: new Set(),
                items: new Set(),
                items_all: new Set(),
                files: {},
            };
        };
        if (!(`doc_${da.文件id}` in workers_works[da.标注者].files)) {
            workers_works[da.标注者].files[`doc_${da.文件id}`] = {
                批次: da.实际批次,
                原句: new Set(),
                替换词: new Set(),
                替换句: new Set(),
                处理的替换词: new Set(),
                处理的替换句: new Set(),
            };
        };
        if (true) {
            workers_works[da.标注者].origins.add(`${da.实际批次}-${da.原句id}`);
            workers_works[da.标注者].clusters_all.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}`);
            workers_works[da.标注者].items_all.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
            all_works.origins.add(`${da.标注者}:${da.实际批次}-${da.原句id}`);
            all_works.clusters_all.add(`${da.标注者}:${da.实际批次}-${da.原句id}-${da.替换词序号}`);
            all_works.items_all.add(`${da.标注者}:${da.实际批次}-${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
            workers_works[da.标注者].files[`doc_${da.文件id}`].原句.add(`${da.实际批次}-${da.原句id}`);
            workers_works[da.标注者].files[`doc_${da.文件id}`].替换词.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}`);
            workers_works[da.标注者].files[`doc_${da.文件id}`].替换句.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
            //
        };
        if (!da.标注已弃用原句) {
            workers_works[da.标注者].clusters.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}`);
            all_works.clusters.add(`${da.标注者}:${da.实际批次}-${da.原句id}-${da.替换词序号}`);
            workers_works[da.标注者].files[`doc_${da.文件id}`].处理的替换词.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}`);
            if (!da.标注已弃用替换词) {
                workers_works[da.标注者].items.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
                all_works.items.add(`${da.标注者}:${da.实际批次}-${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
                workers_works[da.标注者].files[`doc_${da.文件id}`].处理的替换句.add(`${da.实际批次}-${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
            };
        };
    };
    return [workers_works, all_works];
};

function readName(file_name) {
    let the_r = /空间关系理解-(\d+)-\[标注\]-([^\]]+)--(\d+-\d+)\.json/;
    let the_m = the_r.exec(file_name);
    if (the_m) {
        let the_g = the_m;
        let the_o = {
            'fileName': file_name,
            'documentId': the_g[1],
            'worker': the_g[2],
            'timeString': the_g[3],
        };
        return the_o;
    } else {
        return {
            'fileName': file_name,
            'documentId': -1,
            'worker': 'unknown',
            'timeString': '000000-000000',
        };
    }
};

function da2key(da) {
    let key = `${da.实际批次}-${da.文件id}-${da.原句id}-${da.替换句序号}`;
    return key;
};

function makeCases(file) {
    // let self = this;
    //
    let 实际批次 = -1;
    let dt = file.timeString.slice(0,6);
    switch (dt) {
        case '210205': 实际批次 = 1; break;
        case '210206': 实际批次 = 1; break;
        case '210207': 实际批次 = 2; break;
        case '210208': 实际批次 = 2; break;
        case '210209': 实际批次 = 3; break;
        case '210210': 实际批次 = 3; break;
        default: 实际批次 = -1;
    };
    //
    let cases = [];
    let case_id = 0;
    //
    let data = file.obj.data;
    // console.log(data);
    for (let data_item of data) {
        //
        let sentence_frags = [];
        for (let frag of data_item.originalSentence) {
            sentence_frags.push(frag.word);
        };
        //
        for (let changes_obj of data_item.changesObjects) {
            //
            let local_sentence_frags = JSON.parse(JSON.stringify(sentence_frags));
            let 被替换词 = local_sentence_frags[changes_obj.changes[0].idx];
            for (let change of changes_obj.changes) {
                local_sentence_frags[change.idx] = `【【${local_sentence_frags[change.idx]}→${change.to}】】`;
            };
            //
            let reason = changes_obj.whyNot;
            let detail = [
                map_detail[reason.isDaPeiBuDang], map_detail[reason.isYuYiChongTu],
                map_detail[reason.isQiTa],
                map_detail[reason.isChangShiError], map_detail[reason.isYuJingError]
            ];
            // console.log(data_item.clusters);
            // console.log(+changes_obj.clusterId);
            let data_case = {
                '文件id': file.documentId,
                '出厂批次id': data_item.batchId,
                '原句id': data_item.itemId,
                '实际批次': 实际批次,
                '替换词序号': changes_obj.clusterId,
                '替换句序号': case_id,
                '标注者': file.worker,
                '时间戳': file.timeString,
                '标注已弃用原句': data_item.originalError,
                '标注已弃用替换词': changes_obj.dropped,
                '被替换词': 被替换词,
                '替换词': changes_obj.changes[0].to,
                '句子内容': local_sentence_frags.join(''),
                '标注初判断': changes_obj.judgeCorrection,
                '标注判断类型': changes_obj.judgeType,
                '标注粗细节': detail,
                '标注细节': reason,
            };
            data_case['kkid'] = da2key(data_case);
            cases.push(data_case);
            case_id += 1;
        };
    };
    return cases;
};

function dict_list_2_table_list(dict_list) {
    let table_list = [];
    let heads = [];
    for (let _k of Object.keys(dict_list[0])) {
        heads.push(_k);
    };
    table_list.push(heads);
    for (let dic of dict_list) {
        let values = [];
        for (let _v of Object.values(dic)) {
            values.push(_v);
        }
        table_list.push(values);
    };
    return table_list;
};

function makePairedCases(cases) {
    let the_dict = {};
    for (let da of cases) {
        let key = ('kkid' in da) ? da.kkid : da2key(da);
        if (!(key in the_dict)) {
            the_dict[key] = [];
        };
        the_dict[key].push(da);
    };
    // return the_dict;
    let the_array = [];
    let nn = 0;
    for (let key in the_dict) {
        let thing = the_dict[key];
        let kkid = ('kkid' in thing[0]) ? thing[0].kkid : da2key(thing[0]);
        if (thing.length == 2) {
            let item = {
                '出厂批次id': thing[0]['出厂批次id'],
                'kkid': kkid,
                '实际批次': thing[0]['实际批次'],
                '文件id': thing[0]['文件id'],
                '原句id': thing[0]['原句id'],
                '替换词序号': thing[0]['替换词序号'],
                '替换句序号': thing[0]['替换句序号'],
                '被替换词': thing[0]['被替换词'],
                '替换词': thing[0]['替换词'],
                '句子内容': thing[0]['句子内容'],
                //
                '标注者1': thing[0]['标注者'],
                '标注者2': thing[1]['标注者'],
                '标注者1时间戳': thing[0]['时间戳'],
                '标注者2时间戳': thing[1]['时间戳'],
                '标注者1已弃用原句': thing[0]['标注已弃用原句'],
                '标注者2已弃用原句': thing[1]['标注已弃用原句'],
                '标注者1已替换词': thing[0]['标注已弃用替换词'],
                '标注者2已替换词': thing[1]['标注已弃用替换词'],
                '标注者1初判断': thing[0]['标注初判断'],
                '标注者2初判断': thing[1]['标注初判断'],
                '标注者1判断类型': thing[0]['标注判断类型'],
                '标注者2判断类型': thing[1]['标注判断类型'],
                '标注者1粗细节': thing[0]['标注粗细节'],
                '标注者2粗细节': thing[1]['标注粗细节'],
                '标注者1细节': thing[0]['标注细节'],
                '标注者2细节': thing[1]['标注细节'],
            };
            the_array.push(item);
        } else {
            nn+=1;
            console.log(`${kkid}(${nn}): ${thing.length}`);
            console.log(`${thing[0].标注者}-${thing[0].标注已弃用原句}-${thing[0].标注已弃用替换词}-${thing[0].句子内容}`);
        };
    };
    return the_array;
};


var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "files": [],
        "cases": [],
        "table_lines": [],
        "origin_batch_map": new Set(),
        "paired_cases": [],
        "workers_works": {},
        "all_works": {
            origins: new Set(),
            clusters: new Set(),
            clusters_all: new Set(),
            items: new Set(),
            items_all: new Set(),
        },
        // "tag_map_1": ['难以判断', '不成立', '成立', '', '勉强成立'],
        // "tag_map_2": ['难以判断', '搭配不当', '意义冲突', '语义变化不大', '语义变化大', '', '', '', '', ''],
        "apiVersion": "21-0220-00",
        "summed": false,
        "summing": false,
        "units_1": 0.2,
        "units_2": 0.1,
        "units_3": 1,
        "price": 0.95,
        "money": 25000,
    },
    methods: {

        clearFiles: function(cmd) {
            let self = this;
            if (!cmd) {
                self.files = self.files.filter(x => x.isUsable);
            } else if (cmd=='drop') {
                self.files = self.files.filter(x => x.isUsable&&x.isInUse);
            } else if (cmd=='all') {
                self.files = [];
            };
        },

        onImport: function() {
            let self = this;
            self.summed = false;
            let fileList = document.forms["file-form"]["file-input"].files;
            // console.log(fileList);
            let file_meta_list = [];
            let idx = 0;
            for (let file of fileList) {
                self.readFile(file);
                // let file_obj = self.readFile(file);
                // self.files.push(file_obj);
            };
        },

        readFile: function(file) {
            let self = this;
            let name_info = readName(file.name);
            let reader = new FileReader();
            reader.readAsText(file, "utf-8");
            reader.onload = function(evt) {
                let file_content_obj = {};
                let isUsable = true;
                try {
                    file_content_obj = JSON.parse(this.result);
                } catch(e) {
                    isUsable = false;
                    console.log('文件因json无法读取而无法使用');
                } finally {
                    //
                };
                //
                if (isUsable) {
                    if ('desc' in file_content_obj && file_content_obj.desc == '空间关系认知语料标注') {
                        // file_content_obj = JSON.parse(this.result);
                    } else {
                        isUsable = false;
                        console.log('文件因不是空间关系认知语料标注文件而无法使用');
                    };
                };
                let file_obj = name_info;
                file_obj['isUsable'] = isUsable;
                file_obj['isInUse'] = true;
                file_obj['obj'] = file_content_obj;
                self.files.push(file_obj);
            }
        },

        makeAllCases: function() {
            let self = this;
            //
            // console.log('makeAllCases');
            //
            self.cases = [];
            for (let file of self.files) {
                if (file.isUsable && file.isInUse) {
                    // console.log('dealing with file');
                    let cases = makeCases(file);
                    for (let data_case of cases) {
                        // console.log('pushing data_case');
                        self.cases.push(data_case);
                    };
                };
            };
            self.summed = true;
        },

        makeMap: function() {
            let self = this;
            let the_map = new Set();
            for (let data_case of self.cases) {
                the_map.add(`${data_case.原句id}-${data_case.实际批次}`);
            };
            // return the_map;
            console.log([... the_map.keys()]);
            let jn = JSON.stringify([... the_map.keys()], null, 2);
            let time_str = self.timeString();
            let filename = `空间关系理解-map--${time_str}.json`;
            var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
            saveAs(file);
        },

        onExportPaired: function() {
            let self = this;
            let paired = makePairedCases(self.cases);
            let jn = JSON.stringify(paired, null, 2);
            let time_str = self.timeString();
            let filename = `空间关系理解-paired--${time_str}.json`;
            var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
            saveAs(file);
        },

        onExportPairedTable: function() {
            let self = this;
            let paired = makePairedCases(self.cases);
            let jn = JSON.stringify(dict_list_2_table_list(paired), null, 2);
            let time_str = self.timeString();
            let filename = `空间关系理解-paired--${time_str}.table.json`;
            var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
            saveAs(file);
        },

        outputComputeWorks: function() {
            let self = this;
            let txt = self.$refs.txt.innerText;
            let time_str = self.timeString();
            let filename = `空间关系理解-工资单--${time_str}.txt`;
            var file = new File([txt], (`${filename}`), { type: "text/plain; charset=utf-8" });
            saveAs(file);
        },

        computeWorks: function() {
            let self = this;
            let things = dealWithWorkers(self.cases)
            self.workers_works = things[0];
            self.all_works = things[1];
        },

        makeTable: function() {
            let self = this;
            self.table_lines = [];
            self.table_lines = dict_list_2_table_list(self.cases);
        },

        onExport: function() {
            let self = this;
            self.makeTable();
            let jn = JSON.stringify(self.table_lines, null, 2);
            // let jn = JSON.stringify(self.table_lines, null, null);
            let filename = self.makeFileName('');
            var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
            saveAs(file);
        },

        timeString: function() {
            let self = this;
            let the_date = new Date();
            let str = `${(''+the_date.getFullYear()).slice(2,4)}${(''+(the_date.getMonth()+1)).length==1?'0':''}${the_date.getMonth()+1}${(''+the_date.getDate()).length==1?'0':''}${the_date.getDate()}-${(''+the_date.getHours()).length==1?'0':''}${the_date.getHours()}${(''+the_date.getMinutes()).length==1?'0':''}${the_date.getMinutes()}${(''+the_date.getSeconds()).length==1?'0':''}${the_date.getSeconds()}`;
            return str;
        },

        makeFileName: function(name) {
            let self = this;
            let time_str = self.timeString();
            // let the_reg = /(--\d{6}-\d{6})?(\.[a-zA-Z0-9]+)$/;
            //let filename = name.replace(the_reg, `--${time_str}`);
            let filename = `空间关系理解-全部数据--${time_str}.table.json`;
            //filename = `${filename}.json`
            return filename;
        },

    },

})
