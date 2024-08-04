
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')


const action = process.argv[2]
let app =  process.argv[3]
const runType = action == 'dev' ? '启动': '打包'

const buildTypeList = ['weapp', 'h5']
let buildType = process.argv[4]

;(() => {

  if(!app) {
      openInquirer()
      return
  }


  function getProjectList() {
    const projectList = fs.readdirSync(path.resolve(__dirname, '../src/apps'))
    // 过滤隐藏文件
    projectList.forEach((item, index) => {
      if(item.indexOf('.') == 0) {
        projectList.splice(index, 1)
      }
    })
    return projectList

  }

  // 未输入项目名称则开启交互命令行
  function openInquirer() {
    const projectList = getProjectList()
    const promptList = [
      {
        type: 'list',
        message: `🚗请选择${runType}的项目:`,
        name: 'pro',
        choices: [...projectList],
      },
    ]
    inquirer.prompt(promptList).then((answers) => {
      app = answers.pro
      if(!buildType) {
        handleBuildType()
        return
      }
      start()
    })
  }

  // 处理打包类型
  function handleBuildType() {
    const promptList = [
      {
        type: 'list',
        message: `🚗请选择打包类型:`,
        name: 'pro',
        choices: [...buildTypeList],
      }
    ]
    inquirer.prompt(promptList).then((answers) => {
      buildType = answers.pro
      start()
    })
  }

  function start() {
    const appPath = path.resolve(__dirname, `../src/apps/${app}`)
    if(!fs.existsSync(appPath)) {
      console.log(`🚫🚫🚫🚫🚫🚫${app}小程序不存在，请检查输入是否正确`)
      return
    }
    // 处理配置文件
    process.env.APP = app
    console.log(`🚀🚀🚀🚀🚀🚀正在${runType}小程序：${app}`)
    let cmd = ''
    if(action == 'dev') {

      cmd = `taro build --type ${buildType} --watch`

    } else {

      cmd = `taro build --type ${buildType}`

    }

    const child = shell.exec(cmd, {async:true})
    child.stdout.on('data', function() {
      // console.log(data)
    })
  }

  start()

})()

