<template>
  <div id="lot">
    <div class="formcontent">
      <el-form :inline="true" :model="form" ref="form" lable-width="70" size="small">
        <el-form-item label="开始日期" prop="开始日期">
          <el-date-picker
            v-model="form.开始日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择开始日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="结束日期">
          <el-date-picker
            v-model="form.结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="LOT NO" prop="LOT">
          <el-input v-model="form.LOT" placeholder="LOT"></el-input>
        </el-form-item>
        <el-form-item label="品名" prop="品名">
          <el-input v-model="form.品名" placeholder="品名"></el-input>
        </el-form-item>
        <el-form-item label="工段" class="inputstyle" prop="工段">
          <el-select v-model="form.工段" placeholder="工段" @change="querymode">
            <el-option class="optionstyle"></el-option>
            <el-option label="G" value="G" class="optionstyle"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="不良模式" class="inputstyle" prop="不良模式">
          <el-select v-model="form.不良模式" placeholder="不良模式">
            <el-option></el-option>
            <el-option
              v-for="(value,i) in options[0]"
              :label="value"
              :value="value"
              class="optionstyle"
              :key="i"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')">查询</el-button>
          <el-button type="warning" @click="resetForm('form')">重置</el-button>
          <el-button type="success" @click="output">下载</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-divider class="divider"></el-divider>
    <el-table
      id="mytable"
      :data="tableData"
      width="100%"
      :span-method="objectSpanMethod"
      border
      stripe
      max-height="750"
      v-loading="loading"
      element-loading-text="努力加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.1)"
    >
      <el-table-column width="50" label="检查" align="center" fixed>
        <h3>G检</h3>
      </el-table-column>
      <el-table-column align="center" width="140" prop="mode" fixed="left">
        <template slot="header">
          <!-- <ul style="padding-left:0"> -->
          <ul style="padding-inline-start: 0;">
            <li>{{firsthead.first}}</li>
            <li>{{firsthead.second}}</li>
            <li>{{firsthead.third}}</li>
            <li>{{firsthead.forth}}</li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item,index) in thead"
        :prop="item.LOTNO"
        :key="index"
        align="center"
        width="180"
      >
        <template slot="header">
          <ul style="padding-inline-start: 0;">
            <li>{{item.品名}}</li>
            <li>{{item.简称}}</li>
            <li>{{item.面取数}}</li>
            <li @click="querylot(item.LOTNO)">
              <el-link>{{item.LOTNO}}</el-link>
            </li>
          </ul>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer :visible.sync="table" direction="ttb" size="60%" title="LOT异常处置信息">
      <h3>LOT:{{querylotNo}}</h3>
      <el-table
        :data="LotData"
        v-loading="loading"
        border
        style="width:100%;overflow:auto"
        max-height="250"
      >
        <el-table-column align="center" property="编号" label="编号"></el-table-column>
        <el-table-column align="center" property="指示" label="指示"></el-table-column>
        <el-table-column align="center" property="指示人员" label="指示人员"></el-table-column>
        <el-table-column align="center" property="确认组" label="确认组"></el-table-column>
        <el-table-column align="center" property="指示时间" label="指示时间"></el-table-column>
        <el-table-column align="center" property="状态" label="状态"></el-table-column>
        <el-table-column align="center" property="结果" label="结果"></el-table-column>
        <el-table-column align="center" property="确认人" label="确认人"></el-table-column>
        <el-table-column align="center" property="确认时间" label="确认时间"></el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>
<script>
import FileSaver from "file-saver";
import XLSX from "xlsx";
import axios from "axios";
import qs from "qs";
export default {
  data() {
    return {
      querylotNo: "",
      LotData: [],
      loading: false,
      table: false,
      tableData: [],
      form: {
        开始日期: "",
        结束日期: "",
        LOT: "",
        品名: "",
        工段: "",
        不良模式: ""
      },
      firsthead: {
        first: "品名",
        second: "简称",
        third: "面取数",
        forth: "LOTNO"
      },
      thead: [],
      options: []
    };
  },
  methods: {
    //不良模式查询
    async querymode() {
      const { data } = await axios.post(
        "../API/DFS/工程检_不良模式.py",
        qs.stringify({
          工段: this.form.工段
        })
      );
      if (data.state === "") {
        data.date = data.data.split(",");
        this.options.push(data.data.split(","));
        console.log(this.options);
      } else {
        alert(data.state);
      }
    },
    //G检数据查询
    async onSubmit() {
      this.loading = true;
      this.tableData = [];
      this.thead = [];
      const { data } = await axios.post(
        "../API/LOT RELEASE/LOTRELEASE_LOT发生率.py",
        qs.stringify(this.form)
      );
      if (data.data.length == 0) {
        this.$message({
          message: "暂无数据",
          type: "warning",
          duration: "1500"
        });
      }
      if (data.state === "") {
        data.data.forEach(element => {
          this.thead.push({
            //表头数据
            品名: element.品名,
            简称: element.简称,
            面取数: element.面取数,
            LOTNO: element.LOT
          });
        });

        let _data = data.data;
        let _data_length = data.data.length;
        for (
          //第一个for循环取每一项的键名
          let index1 = 4;
          index1 < Object.keys(_data[0]).length;
          index1++
        ) {
          let datakey = Object.keys(_data[0])[index1];
          let newmap = new Map();
          newmap.set("mode", datakey);
          for (let index2 = 0; index2 < _data_length; index2++) {
            //第二个for取出之前键名对应的值
            let datavalue = _data[index2][Object.keys(_data[0])[index1]];
            if (datakey == "投入日期") {
              datavalue = datavalue.slice(0, 10);
            }
            newmap.set(_data[index2][Object.keys(_data[index2])[0]], datavalue);
          }
          let newobj = this.strMapToObj(newmap);
          this.tableData.push(newobj);
          this.loading = false;
        }
      }
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    //Lot异常处置信息查询
    async querylot(lot) {
      const { data } = await axios.post(
        "../API/LOT RELEASE/制品指示.py",
        qs.stringify({
          LOT: lot
        })
      );
      if (data.data.length === 0) {
        this.$message({
          message: "暂无数据",
          type: "warning",
          duration: "1500"
        });
      } else {
        this.table = true;
        this.querylotNo = lot;
        this.LotData = data.data;
      }
    },
    //表格导出
    output(tableID) {
      let table = document.querySelector("#mytable").cloneNode(true);
      // fixed属性导致多出一个table，会下载重复内容，删除掉
      table.removeChild(table.querySelector(".el-table__fixed"));
      let wb = XLSX.utils.table_to_book(table, { raw: true }); 
      /* get binary string as output */
      let wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array"
      });
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
           "lotrelease.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },
    //Map转obj
    strMapToObj(strMap) {
      let obj = Object.create(null);
      for (let [k, v] of strMap) {
        obj[k] = v;
      }
      return obj;
    },
    //首列合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        //列号为0
        if (rowIndex % this.tableData.length === 0) {
          //要合并的行为总行数
          return {
            rowspan: this.tableData.length, //合并的行数就是总行数
            colspan: 1 //合并到第一列
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    }
  }
};
</script>
<style>
body {
  margin: 0;
}
li {
  list-style: none;
}
ul {
  width: 100%;
  float: left;
}
.formcontent {
  margin: 8px 0 0 8px;
}
.el-link {
  font-weight: bold !important;
}
.el-input,
.el-select {
  width: 140px !important;
}
.el-date-editor {
  width: 140px !important;
}
.el-form-item {
  margin-bottom: 12px;
}
.el-divider--horizontal {
  margin: 0 !important;
}
.el-table th > .cell {
  padding: 0 !important;
}
th {
  padding: 0 !important;
}
td {
  width: 190px !important;
  text-align: center !important;
}

.el-table__fixed-right {
  height: 100% !important;
}
/* .demo-form-inline{
    width: 150px
} */
</style>