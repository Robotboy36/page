
## 原生js分页插件，不依赖任何其他库， 支持IE9+
## 示例
![示例](img/demo1.png)

## 使用方式
在页码容器上加上pager属性， 或者直接将元素通过option.el传入
`$.Pager.init( option );`

option 为参数

  option = {
  	el //页码容器
  	curPage  // 当前页， 默认1
  	totalPage // 总页数
  	total  // 总条数
  	pageSize  // 每页显示条目， 默认10
  	showJump  // 是否显示跳转按钮， 默认 false
  	onJump  // 当页码切换时的回调函数， 带有参 page
  }
