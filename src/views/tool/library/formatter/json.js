import prettier from "prettier/standalone";
import parserJson5 from "prettier/parser-babel";

export const beautify = (code, {tab = 4, sort = false} = {}) => {
    if (sort) {
        code = JSON.stringify(objKeySort(JSON.parse(code)))
    }
    return prettier.format(code, {
        parser: "json5",
        plugins: [parserJson5],
        quoteProps: "preserve",
        trailingComma: "none",
        tabWidth: tab,
        printWidth: 1
    })
}
export const objectBeautify = (codeObject, option = {}) => {
    return beautify(JSON.stringify(codeObject), option)
}
// 排序算法
export const objKeySort = (obj) => {//排序的函数
    if (Array.isArray(obj)) {
        let arr = [];
        for (let key in obj) {
            arr.push(objKeySort(obj[key]));
        }
        return arr;
    }

    let newkey = Object.keys(obj).sort();
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    let newObj = {};//创建一个新的对象，用于存放排好序的键值对
    for (let i = 0; i < newkey.length; i++) {//遍历newkey数组
        if (obj[newkey[i]] instanceof Object) {
            newObj[newkey[i]] = objKeySort(obj[newkey[i]]);
        } else {
            newObj[newkey[i]] = obj[newkey[i]];
        }
    }
    return newObj;//返回排好序的新对象
}
// eslint-disable-next-line no-unused-vars
export const compress = (code, options = {}) => {
    let result = []
    for (let i = !1, o = 0, r = (code = code.split("\n").join(" ")).length; o < r; o++) {
        let a = code.charAt(o);
        i && a === i ? "\\" !== code.charAt(o - 1) && (i = !1) : i || '"' !== a && "'" !== a ? i || " " !== a && "\t" !== a || (a = "") : i = a
        result.push(a)
    }
    return result.join("")
}

export default {
    beautify, compress, objectBeautify, objKeySort
}
