

var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "file_meta_list": [],
        "current_file_meta": {},
        "data": [],
        "checker": "",
        "filted_num": 0,
        "tag_map_1": ['难以判断', '不成立', '成立', '', '勉强成立'],
        "tag_map_2": ['难以判断', '搭配不当', '意义冲突', '语义变化不大', '语义变化大', '', '', '', '', ''],
        "showLoadLocalStorage": false,
        "documentId": -1,
        "desc": "空间关系认知语料标注",
        "apiVersion": "21-0131-00",
        "meta": {
            "checkers": [],
            "createdTime": "2021-01-30",
            "modifiedTime": "2021-01-30",
            "stage": 1
        },
        "ui": {
            // current_page: 'temporary',
            modal_open: 0,
            modal_type: 'G',
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
        "show_filter": 0,
        "kaiguans": {
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 0,
            5: 1,
            6: 1,
            7: 1,
            8: 1,
            9: 1,
            10: 1,
            11: 1,
            12: 1,
            13: 1,
            14: 1,
            15: 1,
            16: 1,
            17: 1,
            18: 1,
            19: 1,
            20: 1,
            21: 1,
            22: 1,
            23: 1,
            24: 1,
            25: 0,
            26: 1,
            27: 1,
            28: 1,
        },
    },
    computed: {
        // filted_num: function() {
        //     let self = this;
        //     if (self.$refs.wrap) {
        //         return self.$refs.wrap.getElementsByClassName("btn-check").length || 0;
        //     };
        //     return 0;
        // },
        done_num: function() {
            let self = this;
            let sum = 0;
            sum = self.data.filter(x=>x.control.checked).length;
            return sum;
        },
        total_num: function() {
            let self = this;
            let sum = self.data.length;
            return sum;
        },
        done_pct: function() {
            let self = this;
            return `${self.done_num / self.filted_num * 100}%`;
        },
    },
    methods: {

        onChecked(_qu_) {
            let self = this;
            if (
                ( (_qu_.type=='A'||_qu_.type=='B'||_qu_.type=='C'||_qu_.type=='D')&&!_qu_.context.includes(_qu_.text1) ) ||
                ( (_qu_.type=='C'||_qu_.type=='D')&&!_qu_.text1.includes(_qu_.替换词) ) ||
                ( (_qu_.type=='A'||_qu_.type=='B'||_qu_.type=='C')&&!_qu_.context.includes(_qu_.text2) ) ||
                ( (_qu_.type=='A')&&!_qu_.text2.includes(_qu_.替换词) )
                ) {
                self.push_alert("danger", "请检查text！");
            } else {
                _qu_.control.checked = !_qu_.control.checked;
            };
            if(window.localStorage){
                window.localStorage['data'] = JSON.stringify(self.data);
                window.localStorage['checker'] = JSON.stringify(self.checker);
                window.localStorage['kaiguans'] = JSON.stringify(self.kaiguans);
                window.localStorage['filename'] = self.current_file_meta.name;
            };
        },

        readDataFromLocalStorage: function() {
            let self = this;
            self.data = [];
            self.data = JSON.parse(window.localStorage['data']);
            self.checker = JSON.parse(window.localStorage['checker']);
            self.kaiguans = JSON.parse(window.localStorage['kaiguans']);
        },

        condition: function(_qu_) {
            let self = this;
            let cond = (
                    (  self.kaiguans[0]  && _qu_.type=='A' ) ||
                    (  self.kaiguans[1]  && _qu_.type=='B' ) ||
                    (  self.kaiguans[2]  && _qu_.type=='C' ) ||
                    (  self.kaiguans[3]  && _qu_.type=='D' ) ||
                    (  self.kaiguans[4]  && _qu_.type=='E' )
                )&&(
                    (  self.kaiguans[5]  && self.judge(_qu_, '代词问题' ) ) ||
                    (  self.kaiguans[6]  && self.judge(_qu_, '人名问题' ) ) ||
                    (  self.kaiguans[7]  && self.judge(_qu_, '包含问题' ) ) ||
                    (  self.kaiguans[8]  && self.judge(_qu_, '困惑符号' ) ) ||
                    (  self.kaiguans[9]  && self.judge(_qu_, '少见符号' ) ) ||
                    (  self.kaiguans[10] && self.judge(_qu_, '断句符号' ) ) ||
                    (  self.kaiguans[11] && self.judge(_qu_, '省略符号' ) ) ||
                    (  self.kaiguans[12] && self.judge(_qu_, '配对符号' ) ) ||
                    (  self.kaiguans[13] && self.judge(_qu_, '词性少见1') ) ||
                    (  self.kaiguans[14] && self.judge(_qu_, '词性少见2') ) ||
                    (  self.kaiguans[15] && self.judge(_qu_, '字数太多1') ) ||
                    (  self.kaiguans[16] && self.judge(_qu_, '字数太多2') ) ||
                    (  self.kaiguans[17] && self.judge(_qu_, '不在文中1') ) ||
                    (  self.kaiguans[18] && self.judge(_qu_, '不在文中2') ) ||
                    (  self.kaiguans[19] && self.judge(_qu_, '这是C2'  ) ) ||
                    (  self.kaiguans[20] && self.judge(_qu_, '常识负例' ) ) ||
                    (  self.kaiguans[27] && self.judge(_qu_, '常识小修' ) ) ||
                    (  self.kaiguans[25]                           )
                )&&(
                    (  self.kaiguans[21] &&  _qu_.judge1 ) ||
                    (  self.kaiguans[22] && !_qu_.judge1 )
                )&&(
                    (  self.kaiguans[23] &&  _qu_.judge2 ) ||
                    (  self.kaiguans[24] && !_qu_.judge2 )
                );
            return cond;
        },

        noProblem: function(_qu_) {
            let self = this;
            let cond = (
                    (  self.kaiguans[0]  && _qu_.type=='A' ) ||
                    (  self.kaiguans[1]  && _qu_.type=='B' ) ||
                    (  self.kaiguans[2]  && _qu_.type=='C' ) ||
                    (  self.kaiguans[3]  && _qu_.type=='D' ) ||
                    (  self.kaiguans[4]  && _qu_.type=='E' )
                )&&(
                    (  !self.judge(_qu_, '代词问题' ) ) &&
                    (  !self.judge(_qu_, '人名问题' ) ) &&
                    (  !self.judge(_qu_, '包含问题' ) ) &&
                    (  !self.judge(_qu_, '困惑符号' ) ) &&
                    (  !self.judge(_qu_, '少见符号' ) ) &&
                    (  !self.judge(_qu_, '断句符号' ) ) &&
                    (  !self.judge(_qu_, '省略符号' ) ) &&
                    (  !self.judge(_qu_, '配对符号' ) ) &&
                    (  !self.judge(_qu_, '词性少见1') ) &&
                    (  !self.judge(_qu_, '词性少见2') ) &&
                    (  !self.judge(_qu_, '字数太多1') ) &&
                    (  !self.judge(_qu_, '字数太多2') ) &&
                    (  !self.judge(_qu_, '不在文中1') ) &&
                    (  !self.judge(_qu_, '不在文中2') ) &&
                    (  !self.judge(_qu_, '这是C2'  ) ) &&
                    // (  !self.judge(_qu_, '常识负例' ) ) &&
                    (  !self.judge(_qu_, '常识小修' ) )
                )&&(
                    (  self.kaiguans[21] &&  _qu_.judge1 ) ||
                    (  self.kaiguans[22] && !_qu_.judge1 )
                )&&(
                    (  self.kaiguans[23] &&  _qu_.judge2 ) ||
                    (  self.kaiguans[24] && !_qu_.judge2 )
                );
            return cond;
        },

        allReason: function() {
            let self = this;
            // self.filted_num = document.getElementsByClassName("btn-check").length || 0;
            for (let i=5; i<=20; i++) {
                self.kaiguans[i] = 1;
            };
            self.kaiguans[27] = 1;
            // self.kaiguans[25] = 1;
            // self.filted_num = document.getElementsByClassName("btn-check").length || 0;
        },
        noneReason: function() {
            let self = this;
            // self.filted_num = document.getElementsByClassName("btn-check").length || 0;
            for (let i=5; i<=20; i++) {
                self.kaiguans[i] = 0;
            };
            self.kaiguans[27] = 0;
            // self.kaiguans[25] = 0;
            // self.filted_num = document.getElementsByClassName("btn-check").length || 0;
        },
        bang: function(tag) {
            let self = this;
            // self.filted_num = document.getElementsByClassName("btn-check").length || 0;
            self.kaiguans[tag]=1-self.kaiguans[tag];
            // self.filted_num = document.getElementsByClassName("btn-check").length || 0;
        },

        judge: function(qu, desc) {
            let self = this;
            switch (desc) {
                case '代词问题':
                    return qu.problems && qu.problems.代词问题;
                case '人名问题':
                    return qu.problems && qu.problems.人名问题;
                case '包含问题':
                    // return qu.problems && qu.problems.包含问题;
                    return (qu.text2.includes(qu.text1)) || (qu.text1.includes(qu.text2));
                case '困惑符号':
                    return qu.textHasConfusingChars;
                case '少见符号':
                    return qu.problems && qu.problems.标点问题.其他符号 || qu.textHasErrorChars;
                case '断句符号':
                    return qu.problems && qu.problems.标点问题.断句符号;
                case '省略符号':
                    return qu.problems && qu.problems.标点问题.省略符号 || qu.textHasEllipsis;
                case '配对符号':
                    return qu.problems && qu.problems.标点问题.配对符号;
                case '词性少见1':
                    return qu.text1posFreq && qu.text1posFreq < 6 || qu.text1posFreq==0;
                case '词性少见2':
                    return qu.text2posFreq && qu.text2posFreq < 6 || qu.text2posFreq==0;
                case '字数太多1':
                    return qu.text1.length > 16;
                case '字数太多2':
                    return qu.text2.length > 16;
                case '不在文中1':
                    // return !qu.text1isInContext&&(qu.type=='A'||qu.type=='B'||qu.type=='C'||qu.type=='D');
                    return (qu.type=='A'||qu.type=='B'||qu.type=='C'||qu.type=='D')&&!qu.context.includes(qu.text1);
                case '不在文中2':
                    // return !qu.text2isInContext&&(qu.type=='A'||qu.type=='B');
                    return (qu.type=='A'||qu.type=='B'||qu.type=='C')&&!qu.context.includes(qu.text2);
                case '这是C2':
                    return qu.isC2;
                case '常识负例':
                    return qu.type=='D' && !qu.judge2;
                case '常识小修':
                    return qu.type=='D' && qu.reasonSubstituted && ((!qu.judge2 && qu.被替换词.length==1) || qu.judge2);
            };
        },

        submit: function(changes_obj){
            let self = this;
            changes_obj.formFilled = true;
            changes_obj.finished = true;
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
            //
            if (window.localStorage && window.localStorage['filename']==self.current_file_meta.name) {
                this.showLoadLocalStorage = true;
            } else {
                this.showLoadLocalStorage = false;
            };
        },

        onExport: function() {
            let self = this;
            if (!this.checker) {
                alert("请填写姓名！")
            } else {
                let jn = JSON.stringify(self.makeExport(), null, 2);
                let filename = self.makeFileName(self.current_file_meta.name);
                var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
                saveAs(file);
            }
        },

        onExportChecked: function() {
            let self = this;
            if (!this.checker) {
                alert("请填写姓名！")
            } else {
                let jn = JSON.stringify(self.makeExportChecked(), null, 2);
                let filename = self.makeFileNameChecked(self.current_file_meta.name);
                var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
                saveAs(file);
            }
        },

        onExportFilted: function() {
            let self = this;
            if (1) {
                let jn = JSON.stringify(self.makeExportFilted(), null, 2);
                let filename = self.makeFileNameFilted(self.current_file_meta.name);
                var file = new File([jn], (`${filename}`), { type: "text/plain; charset=utf-8" });
                saveAs(file);
            }
        },

        makeExport: function() {
            let self = this;
            let things = self.data;
            for (let dataItem of things) {
                // 添加工作人员，并去除人员列表中的空字符串
                if (dataItem.checkers.indexOf(self.checker)==-1 && self.checker.trim()!="") {
                    dataItem.checkers.push(self.checker.trim());
                };
                dataItem.checkers = dataItem.checkers.filter(i => i!="");
            };
            //
            let product = {};
            product.questions = things;
            return product;
        },

        makeExportChecked: function() {
            let self = this;
            let things = self.data.filter(x => x.control.checked);
            for (let dataItem of things) {
                // 添加工作人员，并去除人员列表中的空字符串
                if (dataItem.checkers.indexOf(self.checker)==-1 && self.checker.trim()!="") {
                    dataItem.checkers.push(self.checker.trim());
                };
                dataItem.checkers = dataItem.checkers.filter(i => i!="");
            };
            //
            let product = {};
            product.questions = things;
            return product;
        },

        makeExportFilted: function() {
            let self = this;
            let things = self.data.filter(x => (self.condition(x)||( self.noProblem(x)&&self.kaiguans[28] ) ));
            for (let dataItem of things) {
                if (dataItem.control.checked) {
                    // 添加工作人员，并去除人员列表中的空字符串
                    if (dataItem.checkers.indexOf(self.checker)==-1 && self.checker.trim()!="") {
                        dataItem.checkers.push(self.checker.trim());
                    };
                    dataItem.checkers = dataItem.checkers.filter(i => i!="");
                };
            };
            //
            let product = {};
            product.questions = things;
            return product;
        },

        timeString: function() {
            let self = this;
            let the_date = new Date();
            let str = `${(''+the_date.getFullYear()).slice(2,4)}${(''+(the_date.getMonth()+1)).length==1?'0':''}${the_date.getMonth()+1}${(''+the_date.getDate()).length==1?'0':''}${the_date.getDate()}-${(''+the_date.getHours()).length==1?'0':''}${the_date.getHours()}${(''+the_date.getMinutes()).length==1?'0':''}${the_date.getMinutes()}`;
            return str;
        },

        makeFileName: function(name) {
            let self = this;
            let time_str = self.timeString();
            let filename = name.replace(/\.json/, ``);
            filename = filename.replace(/(--\d{6}-\d{4})$/, ``);
            filename = filename.replace(/-\[审核-by-[^\]]+\]$/, ``);
            filename = `${filename}-[审核-by-${self.checker}]--${time_str}.json`;
            //filename = `${filename}.json`
            return filename;
        },

        makeFileNameChecked: function(name) {
            let self = this;
            let time_str = self.timeString();
            // let the_reg = /(--\d{6}-\d{6})?(\.[a-zA-Z0-9]+)$/;
            //let filename = name.replace(the_reg, `--${time_str}`);
            let filename = `空间语义理解评测-[检查完毕]-${self.checker}--${time_str}.json`;
            //filename = `${filename}.json`
            return filename;
        },

        makeFileNameFilted: function(name) {
            let self = this;
            let time_str = self.timeString();
            // let the_reg = /(--\d{6}-\d{6})?(\.[a-zA-Z0-9]+)$/;
            //let filename = name.replace(the_reg, `--${time_str}`);
            let filename = `空间语义理解评测-[检查筛选]-${self.checker}--${time_str}.json`;
            //filename = `${filename}.json`
            return filename;
        },

        readData: function() {
            let self = this;
            let reader = new FileReader();
            reader.readAsText(self.current_file_meta.file, "utf-8");
            reader.onload = function(evt) {
                let result = JSON.parse(this.result);
                let data = result.questions;
                for (let da of data) {
                    if (!("checkers" in da)) {
                        da.checkers = [];
                    };
                    if (!("note" in da)) {
                        da.note = "";
                    };
                    if (!("control" in da)) {
                        da.control = {
                            'checked': false,
                            'dropped': false,
                            'showChange': false,
                            'showDetail': false,
                        };
                    };
                };
                self.data = data;
            }
        },





        toggle_modal: function(type) {
            this.ui.modal_type = type;
            this.ui.modal_open = 1 - this.ui.modal_open;
        },
        push_alert: function(cls, ctt) {
            console.log([cls, ctt]);
            let idx = this.ui.alerts_last_idx+1;
            this.ui.alerts.push({
                'idx': idx,
                'class': cls,
                'html': ctt,
                'show': 1,
            });
            this.ui.alerts_last_idx += 1;
            let that = this;
            setTimeout(function(){that.remove_alert(idx);},3000)
        },
        remove_alert: function(idx) {
            this.ui.alerts.filter(alert => alert.idx==idx)[0].show = 0;
        },

    },
    // watch: {
    //     documentId(val) {
    //         // 如果有localStorage，且对于该documentId有缓存数据，就显示【加载缓存数据】按钮
    //         console.log(window.localStorage['documentId'], val)
    //         if(window.localStorage && window.localStorage['documentId'] == val){
    //             this.showLoadLocalStorage = true;
    //         }else{
    //             this.showLoadLocalStorage = false;
    //         }
    //     }
    // },
    // created() {
    //     let self = this;
    // },
    updated() {
        let self = this;
        self.filted_num = document.getElementsByClassName("btn-check").length || 0;
    },
    // beforeDestroyed() {
    //     let self = this;
    // },

});

