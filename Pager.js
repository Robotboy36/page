
/**
*   在init的同时传入相关参数
**/
;(function(win) {

    //联系jq
    if( typeof jQuery === 'undefined' ){
        $ = {};
    }
    
	
	/**
	 * 工具集
	 * */
	$.tools = {	
		
		format: function( str, data ){			
			var matchs = str.match(/{[^}]+?}/g);	
			
			if( matchs === null ){
				return '';
			}
			
			var maLen = matchs.length;
			data = data instanceof Array ? data : [data];	
			
			var html = '';
			for( var n=0, len=data.length; n<len; n++ ){
				var obj = data[n];
	
				var temp = str;
				for( var i=0; i<maLen; i++ ){				
					var match = matchs[i];
					var name = match.replace(/{|}/g, "");
					temp = temp.replace( match, obj[name] || '' );
				}
	
				html += temp;
			}		
			
			return html;
		}
	}
	

    /*
    * 分页相关
    */
    $.Pager = function(){
    	this.el = null

        this.inited = 0  //是否已经初始化过

        this.curPage = 1
        this.totalPage = 0

        this.total = 0
        this.pageSize = 10
        
        this.showJump = false;

        this.splitStr = '<li class="disabled"><span class="splitStr"></span></li>'

        this.template = 
            '<div class="pager-info">'+
                '<span class="pager-index-tip">共{total}条,每页{pageSize}</span>'+
                '<span class="pager-index-tip">{curPage}/{totalPage}</span>'+
                '<div class="pager-jump" style="display:{showJump}">' +
	                '跳转到 <input value="{curPage}" maxlength="6" />' +
	                '<button class="jump-btn">确定</button>'+
	            '</div>' + 
            '</div>'+
            '<div class="pager-list">'+
            '    <div class="pager-next{nextAble}">下一页</div>'+
            '    <ul>{pageList}</ul>'+
            '    <div class="pager-prev{prevAble}">上一页</div>'+
            '</div>'
    }


    ///初始化
    $.Pager.init = function( opt ){  
    	var page = new $.Pager();
       
        for( var name in opt ){
            if( opt.hasOwnProperty(name) ){
                page[name] = opt[name];
            }
        }    
        
        var el = opt && opt.el || '[pager]';        
        el = typeof el === 'string' ? document.querySelector(el) : el;
        
        if( el.size && el.size() > 0 ){
        	el = el[0];
        }
        
        //元素是否存在
        if( !el ){
            console.error( '请指定页码元素, 然后再刷新' );
            return;
        } 
            
        //是否显示jump
        page.showJump = page.showJump ? 'inline-block' : 'none';
        
        page.el = el;        
        page.totalPage = Math.ceil( page.total / page.pageSize );        
        page.updatePage();
        
        if( !page.inited ){
            page.inited = 1;
            page.event();
        } 
    }


    ///更新页码
    $.Pager.prototype.updatePage = function(){       
        var pageList = '';
        var start = this.curPage - 2 > 1 ? this.curPage - 2 : 2;
        var end = this.curPage + 2 < this.totalPage ? this.curPage + 2 : this.totalPage-1;

		if( this.totalPage > 0 ){
	        //第一部分
	        pageList += '<li';
	        pageList += this.curPage === 1 ? ' class="cur"' : '';
	        pageList += '>1</li>{splitBefore}';
	
	        //中间页码
	        for( var i=start; i<= end; i++ ){
	            pageList += '<li';
	            pageList += i === this.curPage ? ' class="cur"' : '';
	            pageList += '>' + i + '</li>';
	        }
	
	        //最后部分
	        if( this.totalPage != 1 ){            
	            pageList += '{splitAfter}<li';
	            pageList += this.curPage === this.totalPage ? ' class="cur"' : '';
	            pageList += '>' + this.totalPage + '</li>';
	        }
	    }

        var splitData = {
            splitBefore: this.curPage>4 ? this.splitStr: '',
            splitAfter: this.curPage<this.totalPage-3 ? this.splitStr: ''
        };
        
        pageList = $.tools.format( pageList, splitData ); 


        //页码信息
        var pageData = {
        	showJump: this.showJump,
        	
            //上一页与下一页按钮控制
            prevAble: this.curPage === 1 ? ' disabled' : '',
            nextAble: this.curPage === this.totalPage || this.totalPage==0 ? ' disabled' : '',

            curPage: this.curPage,
            totalPage: this.totalPage,
            pageSize: this.pageSize,
            total: this.total,

            pageList: pageList
        };
        
        var pageHtml = $.tools.format( this.template, pageData );    
        
        if( !this.totalPage ){
        	pageHtml = '';
        }
        
        this.el.innerHTML = pageHtml;
    }


    ///事件处理
    $.Pager.prototype.event = function(){
        var _this = this;
                
        _this.el.addEventListener("selectstart", function(e){ e.preventDefault();});        
        _this.el.addEventListener("click", onClickLi, false);        
        
        function onClickLi(e){
	        var target = e.target;
	        var tagName = target.tagName;
	        var page = target.textContent - 0;
	        var className = target.className;
	
	
	        if( target.classList.contains("disabled") || target.classList.contains("cur") ){
	            return false;
	        }
	
	        switch( className ){
	            case '': tagName==="LI" && _this.goPage( page ); break;
	
	            case 'pager-prev': _this.prev(); break;
	
	            case 'pager-next': _this.next(); break;
	            
	            case 'jump-btn': _this.jump(); break;
	        }
	    }
    }
    
    
    ///
    $.Pager.prototype.prev = function(){

        if( this.curPage > 1 ){
            this.curPage--
        }else{
        	return;
        }

        this.goPage();
    }

    ///
    $.Pager.prototype.next = function(){
        
        if( this.curPage < this.totalPage ){
            this.curPage++
        }else{
        	return;
        }

        this.goPage();
    }
    
    ///
    $.Pager.prototype.jump = function(){    	
    	var inputEl = this.el.getElementsByTagName('input')[0];
    	var pageIndex = inputEl.value.trim() - 0;
    	
    	if( isNaN(pageIndex) ){
    		console.error('请输入数字');
    		pageIndex = this.curPage;
    	}
    	
    	this.goPage( pageIndex );
    }

    ///
    $.Pager.prototype.goPage = function( pageIndex ){        
        this.curPage = pageIndex || this.curPage;
    	
    	this.curPage = this.curPage < 1 ? 1: this.curPage;    	
    	this.curPage = this.curPage > this.totalPage ? this.totalPage: this.curPage;
    	
        this.updatePage();
        this.onJump && this.onJump( this.curPage );
    }

    // 保留接口， 方便改造cmd，amd模式
    return $.Pager;
})(window);

