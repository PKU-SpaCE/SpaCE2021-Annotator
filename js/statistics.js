
function difference(setA, setB) {
    let _difference = new Set(setA);
    for (let elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}

var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "file_meta_list": [],
        "current_file_meta": {},
        "data": [],
        "workers_works": {},
        "show_work": false,
        "show_data": true,
        "tag_map_1": ['难以判断', '不成立', '成立', '', '勉强成立'],
        "tag_map_2": ['难以判断', '搭配不当', '意义冲突', '语义变化不大', '语义变化大', '', '', '', '', ''],
        "kaiguans": {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 1,
            11: 0,
            12: 0,
            13: 0,
            14: 0,
            15: 0,
            16: 0,
            17: 0,
            18: 0,
            19: 0,
            20: 0,
        },
    },
    computed: {
        替换句总数量: function(){
            let self = this;
            let sum = self.data.length;
            return sum;
        },
        适合评估一致性的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>da.适合评估一致性).length;
            return sum;
        },
        都觉得成立的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==2&&da.标注者2初判断==2)).length;
            return sum;
        },
        都觉得语义变化不大的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1判断类型==3&&da.标注者2判断类型==3)).length;
            return sum;
        },
        都觉得语义变化大的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1判断类型==4&&da.标注者2判断类型==4)).length;
            return sum;
        },
        语义变化判断存在差异的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>((da.标注者1判断类型==4&&da.标注者2判断类型==3)||(da.标注者1判断类型==3&&da.标注者2判断类型==4))).length;
            return sum;
        },
        都觉得不成立的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==1&&da.标注者2初判断==1)).length;
            return sum;
        },
        都觉得勉强成立的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==4&&da.标注者2初判断==4)).length;
            return sum;
        },
        分别觉得不成立和勉强成立的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==1&&da.标注者2初判断==4||da.标注者1初判断==4&&da.标注者2初判断==1)).length;
            return sum;
        },
        分别觉得不成立和勉强成立但字符串有所一致的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==1&&da.标注者2初判断==4||da.标注者1初判断==4&&da.标注者2初判断==1)&&da.细节一致).length;
            return sum;
        },
        都认为非成立且至少一个觉得勉强成立且字符串有所一致的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者2初判断==4||da.标注者1初判断==4)&&da.细节一致).length;
            return sum;
        },
        判断题可出数量: function(){
            let self = this;
            let sum = self.都觉得成立的替换句数量+self.都觉得不成立的替换句数量+self.都认为非成立且至少一个觉得勉强成立且字符串有所一致的替换句数量;
            return sum;
        },
        都觉得不成立或勉强成立的替换句数量: function(){
            let self = this;
            let sum = self.都觉得不成立的替换句数量+self.都觉得勉强成立的替换句数量+self.分别觉得不成立和勉强成立的替换句数量;
            return sum;
        },
        分别觉得成立和不成立的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==1&&da.标注者2初判断==2||da.标注者1初判断==2&&da.标注者2初判断==1)).length;
            return sum;
        },
        分别觉得成立和勉强成立的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>(da.标注者1初判断==2&&da.标注者2初判断==4||da.标注者1初判断==4&&da.标注者2初判断==2)).length;
            return sum;
        },
        粗细节一致的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>da.粗细节一致).length;
            return sum;
        },
        细节一致的替换句数量: function(){
            let self = this;
            let sum = self.data.filter(da=>da.细节一致).length;
            return sum;
        },

    },
    methods: {

        bang:function(tag) {
            let self = this;
            // console.log(tag);
            // console.log(self.kaiguans[tag]);
            self.kaiguans[tag]=1-self.kaiguans[tag];
            // console.log(self.kaiguans[tag]);
        },

        onImport: function() {
            let self = this;
            let fileList = document.forms["file-form"]["file-input"].files;
            // console.log(fileList);
            let file_meta_list = [];
            let idx = 0;
            for (let file of fileList) {
                file_meta_list.push({
                    "idx": idx,
                    "name": file.name,
                    "file": file,
                    "url": URL.createObjectURL(file),
                    // "content": "",
                });
                idx += 1;
            }
            self.file_meta_list = file_meta_list;
            self.current_file_meta = file_meta_list[idx-1];
            // console.log(self.current_file_meta);
            self.readData();
        },

        readData: function() {
            let self = this;
            let reader = new FileReader();
            reader.readAsText(self.current_file_meta.file, "utf-8");
            reader.onload = function(evt) {
                let result = JSON.parse(this.result);
                let data = [];
                data = self.table2obj(result);
                self.data = self.dealWithData(data);
                self.workers_works = self.dealWithWorkers(data);
            }
        },

        dealWithWorkers: function(data) {
            let self = this;
            let workers_works = {};
            for (let da of data) {
                if (!(da.标注者1 in workers_works)) {
                    workers_works[da.标注者1]={
                        origins: new Set(),
                        clusters: new Set(),
                        items: new Set(),
                    };
                };
                if (!da.标注者1已弃用) {
                    workers_works[da.标注者1].origins.add(`${da.原句id}`);
                    workers_works[da.标注者1].clusters.add(`${da.原句id}-${da.替换词序号}`);
                    workers_works[da.标注者1].items.add(`${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
                };
                if (!(da.标注者2 in workers_works)) {
                    workers_works[da.标注者2]={
                        origins: new Set(),
                        clusters: new Set(),
                        items: new Set(),
                    };
                };
                if (!da.标注者2已弃用) {
                    workers_works[da.标注者2].origins.add(`${da.原句id}`);
                    workers_works[da.标注者2].clusters.add(`${da.原句id}-${da.替换词序号}`);
                    workers_works[da.标注者2].items.add(`${da.原句id}-${da.替换词序号}-${da.替换句序号}`);
                };
            };
            return workers_works;
        },

        table2obj: function(raw) {
            let self = this;
            let data = [];
            for (let i in raw) {
                if (i == 0) {
                    // console.log('');
                } else {
                    let obj = {};
                    for (let x in raw[0]) {
                        obj[raw[0][x]] = raw[i][x];
                    }
                    data.push(obj);
                };
            };
            return data;
        },

        dealWithData: function(data) {
            let self = this;
            let new_data = [];
            for (let da of data) {
                //
                da.存在弃用 = da.标注者1已弃用 || da.标注者2已弃用;
                da.一人弃用 = da.标注者1已弃用 != da.标注者2已弃用;
                da.两人都弃用 = da.标注者1已弃用 && da.标注者2已弃用;
                //
                da.初判断有难以判断 = da.标注者1初判断==0 || da.标注者2初判断==0;
                da.初判断只有一个难以判断 = (da.标注者1初判断==0&&da.标注者2初判断!=0) || (da.标注者1初判断!=0&&da.标注者2初判断==0);
                da.初判断都难以判断 = da.标注者1初判断==0 && da.标注者2初判断==0;
                //
                da.适合评估一致性 = !da.存在弃用 && !da.初判断有难以判断
                //
                da.初判断数值不一致 = da.标注者1初判断!=da.标注者2初判断;
                da.初判断看起来不一致 = da.适合评估一致性&&da.初判断数值不一致;
                //
                da.粗细节一致数量 = 0;
                for (let i=0; i<5; i++) {
                    if (da.标注者1粗细节[i]==da.标注者2粗细节[i]&&da.标注者2粗细节[i]==true) {da.粗细节一致数量+=1};
                };
                da.粗细节有效数量 = 0;
                for (let i=0; i<5; i++) {
                    if (da.标注者1粗细节[i]==true||da.标注者2粗细节[i]==true) {da.粗细节有效数量+=1};
                };
                da.粗细节一致程度 = da.粗细节一致数量/da.粗细节有效数量;
                da.粗细节一致 = da.粗细节一致程度==1;
                //
                da.细节之搭配判断有所一致 = (
                    (da.标注者1细节.text_1_1!=""&&da.标注者1细节.text_1_2!="")||
                    (da.标注者2细节.text_1_1!=""&&da.标注者2细节.text_1_2!=""))&&(
                    da.标注者1细节.text_1_1==da.标注者2细节.text_1_1||
                    da.标注者1细节.text_1_1==da.标注者2细节.text_1_2||
                    da.标注者1细节.text_1_2==da.标注者2细节.text_1_1||
                    da.标注者1细节.text_1_2==da.标注者2细节.text_1_2);
                da.细节之语义判断有所一致 = (
                    (da.标注者1细节.text_2_1!=""&&da.标注者1细节.text_2_2!="")||
                    (da.标注者2细节.text_2_1!=""&&da.标注者2细节.text_2_2!=""))&&(
                    da.标注者1细节.text_2_1==da.标注者2细节.text_2_1||
                    da.标注者1细节.text_2_1==da.标注者2细节.text_2_2||
                    da.标注者1细节.text_2_2==da.标注者2细节.text_2_1||
                    da.标注者1细节.text_2_2==da.标注者2细节.text_2_2);
                da.细节之常识判断有所一致 = (
                    (da.标注者1细节.text_4_1!=""&&da.标注者1细节.text_4_2!="")||
                    (da.标注者2细节.text_4_1!=""&&da.标注者2细节.text_4_2!=""))&&(
                    da.标注者1细节.text_4_1==da.标注者2细节.text_4_1||
                    da.标注者1细节.text_4_1==da.标注者2细节.text_4_2||
                    da.标注者1细节.text_4_2==da.标注者2细节.text_4_1||
                    da.标注者1细节.text_4_2==da.标注者2细节.text_4_2);
                da.细节之语境判断有所一致 = (
                    (da.标注者1细节.text_5_1!=""&&da.标注者1细节.text_5_2!="")||
                    (da.标注者2细节.text_5_1!=""&&da.标注者2细节.text_5_2!=""))&&(
                    da.标注者1细节.text_5_1==da.标注者2细节.text_5_1||
                    da.标注者1细节.text_5_1==da.标注者2细节.text_5_2||
                    da.标注者1细节.text_5_2==da.标注者2细节.text_5_1||
                    da.标注者1细节.text_5_2==da.标注者2细节.text_5_2);
                da.细节之其他判断有所一致 = (da.标注者1细节.text_3!=""||da.标注者2细节.text_3!="") && (da.标注者1细节.text_3 == da.标注者2细节.text_3);
                //
                da.细节一致情况数组 = [da.细节之搭配判断有所一致, da.细节之语义判断有所一致, da.细节之常识判断有所一致, da.细节之语境判断有所一致, da.细节之其他判断有所一致];
                da.细节一致数量 = +da.细节之搭配判断有所一致+da.细节之语义判断有所一致+da.细节之常识判断有所一致+da.细节之语境判断有所一致+da.细节之其他判断有所一致;
                da.细节一致程度 = da.细节一致数量/da.粗细节一致数量;
                da.细节一致 = da.细节一致程度==1;
                //
                //
                new_data.push(da);
            };
            return new_data;
        },

    },

})
