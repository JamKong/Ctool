<template>
    <div ref="container" class="diff-editor" :style="`height:${containerHeight};width:${width}`"></div>
</template>
<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import formatter from "../library/formatter";

const allowFormatterLanguage = {
    html: "html",
    typescript: "ts",
    javascript: "js",
    json: "json",
    graphql: "graphql",
    java: "java",
    markdown: "markdown",
    php: "php",
    css: "css",
    scss: "scss",
    less: "less",
    sql: "sql",
    xml: "xml",
    yaml: "yaml",
    vue: "vue",
    angular: "angular",
}

export default {
    name: 'diffEditor',
    props: {
        value: {
            type: Object
        },
        language: {
            type: String,
            default: ""
        },
        autoHeight: {
            type: Number,
            default: 0
        },
        theme: {
            type: String,
            default: 'vs'
        },
        roundedSelection: {
            type: Boolean,
            default: true
        },
        height: {
            type: String,
            default: "350px"
        },
        width: {
            type: String,
            default: "100%"
        },

    },
    watch: {
        value(newValue) {
            if (this.editor !== null
                && (
                    this.original.getValue() !== newValue['original']
                    || this.modified.getValue() !== newValue['modified']
                )) {
                this.original.setValue(newValue['original'])
                this.modified.setValue(newValue['modified'])
            }
        },
        language(newValue) {
            if (this.editor !== null) {
                monaco.editor.setModelLanguage(this.editor.getOriginalEditor().getModel(), newValue)
                monaco.editor.setModelLanguage(this.editor.getModifiedEditor().getModel(), newValue)
            }
        },
        theme(newValue) {
            if (this.editor !== null) {
                monaco.editor.setTheme(newValue)
            }
        }
    },
    created() {
        if (this.autoHeight > 0) {
            this.containerHeight = (window.innerHeight - this.autoHeight) + "px"
        } else {
            this.containerHeight = this.height
        }
    },
    mounted() {
        this.initEditor()
    },
    data() {
        return {
            editor: null,
            original: null,
            modified: null,
            containerHeight: ""
        }
    },
    methods: {
        initEditor() {
            this.$refs.container.innerHTML = ''
            this.editor = monaco.editor.createDiffEditor(this.$refs.container, {
                theme: this.theme,
                roundedSelection: this.roundedSelection,
                automaticLayout: true,
                renderSideBySide: true
            })
            this.original = monaco.editor.createModel(this.value['original'], this.language)
            this.modified = monaco.editor.createModel(this.value['modified'], this.language)
            this.editor.setModel({original: this.original, modified: this.modified})
            this.editor.getOriginalEditor().updateOptions({readOnly: false})

            this.original.onDidChangeContent(() => {
                console.log("this.value.original:" + this.value.original);
                console.log("this.original.getValue():" + this.original.getValue());
                if (this.value.original !== this.original.getValue()) {
                    this.value.original = this.original.getValue()
                    this.$emit('input', this.value)
                }
            })
            this.modified.onDidChangeContent(() => {
                if (this.value.modified !== this.modified.getValue()) {
                    this.value.modified = this.modified.getValue()
                    this.$emit('input', this.value)
                }
            })
        },
        // 行内模式
        inline(value) {
            if (this.editor) {
                value = !!value;
                this.editor.updateOptions({renderSideBySide: !!value})
                this.editor.getOriginalEditor().updateOptions({readOnly: !value})
                this.editor.getModifiedEditor().updateOptions({readOnly: !value})
            }
        },
        format(value) {
            if (this.editor) {
                if (!(this.language in allowFormatterLanguage)) {
                    throw new Error("当前代码无法格式化");
                }
                if (value) {
                    let original = this.original.getValue();
                    let modified = this.modified.getValue();
                    if(this.language === 'json'){
                        original = JSON.stringify(this.objKeySort(JSON.parse(original)));
                        modified = JSON.stringify(this.objKeySort(JSON.parse(modified)));
                    }
                    this.original.setValue(formatter(original, allowFormatterLanguage[this.language], {}));
                    this.modified.setValue(formatter(modified, allowFormatterLanguage[this.language], {}));
                }
            }
        },
        // 排序算法
        objKeySort(obj) {//排序的函数
            if (Array.isArray(obj)) {
                let arr = [];
                for (let key in obj) {
                    arr.push(this.objKeySort(obj[key]));
                }
                return arr;
            }

            let newkey = Object.keys(obj).sort();
            //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
            let newObj = {};//创建一个新的对象，用于存放排好序的键值对
            for (let i = 0; i < newkey.length; i++) {//遍历newkey数组
                if (obj[newkey[i]] instanceof Object) {
                    newObj[newkey[i]] = this.objKeySort(obj[newkey[i]]);//向新创建的对象中按照排好的顺序依次增加键值对

                } else {
                    newObj[newkey[i]] = obj[newkey[i]];//向新创建的对象中按照排好的顺序依次增加键值对
                }
            }
            return newObj;//返回排好序的新对象
        }
    }
};
</script>

