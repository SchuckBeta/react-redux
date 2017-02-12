import React, { Component } from 'react';
import './Grid.less';
import Pager from './Pager';
import { hasPrivilege } from '../common';

class Grid extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            model: null,
            total: 1,
            index: 1,
            create: ()=>{},
            update: ()=>{},
            remove: ()=>{},
            toolbarDom: null,
            columnsDom: null,
            dataDom: null,
            pagerOption: {}
        }
    }
    convertDate = num => {
        return parseInt(num) > 9 ? num : '0' + num;
    };
    formatDate = (format, value) => {
        let date = new Date(value);
        if (format.match(/yyyy/i)) {
            format = format.replace(/yyyy/i, date.getFullYear());
        }
        if (format.match(/MM/)) {
            format = format.replace(/MM/, this.convertDate(date.getMonth() + 1));
        }
        if (format.match(/dd/i)) {
            format = format.replace(/dd/i, date.getDate() > 9 ? date.getDate() : '0' + date.getDate());
        }
        if (format.match(/hh/i)) {
            format = format.replace(/hh/i, this.convertDate(date.getHours()));
        }
        if (format.match(/mm/)) {
            format = format.replace(/mm/, this.convertDate(date.getMinutes()));
        }
        return format;
    };
    initToolbar = (toolbar, action) => {
        let toolbarContent = [];
        if(toolbar){
            toolbarContent = toolbar.map( (item, index) => {
                let name = item.name;
                let className = item.class ? item.class : "";
                let action = (item.option && item.option.action) ? item.option.action : null;
                if(!hasPrivilege(item.option, myPrivilege)){
                    return "";
                }
                switch(name){
                    case 'load':
                        this.reload = action;// load 不添加按钮
                        return "";
                    case 'create':
                        name = '添加';
                        className += ' fa fa-plus ';
                        this.setState({
                            create: action
                        });
                        action = this.create;
                        break;
                    case 'update':
                        name = '编辑';
                        className += ' fa fa-edit ';
                        this.setState({
                            update: action
                        });
                        action = this.update;
                        break;
                    case 'remove':
                        name = '删除';
                        className += ' fa fa-remove ';
                        this.setState({
                            remove: action
                        });
                        action = this.remove;
                        break;
                    default:
                        break;
                }
                return (
                    <a key={ index } className='link-btn' onClick={ action }><i className={ className }> </i><span>{ name }</span></a>
                )
            });
            let actionContent = [];
            if(action){
                actionContent = action.map( (item, index) => {
                    let className = item.class ? item.class : "";
                    let action = (item.option && item.option.action) ? item.option.action : null;
                    if(!hasPrivilege(item.option, myPrivilege)){
                        return "";
                    }
                    return (
                        <a key={ index } className='link-btn' onClick={ this.callMethod.bind(this, action, item.isSelect) }><i className={ className }> </i><span>{ item.name }</span></a>
                    )
                })
            }
            if(toolbarContent){
                if(actionContent.length > 0){
                    toolbarContent = toolbarContent.concat(actionContent);
                }
                toolbarContent = (
                    <ul className='toolbar'>
                        { toolbarContent }
                    </ul>
                )
            }
        }
        return toolbarContent;
    };
    initColumns = (columns) => {
        let columnsDom = null;
        if(columns && columns.length > 0){
            columnsDom = columns.map( (item, index) => {
                let className = item.class ? item.class : '';
                let width = item.width ? ( (item.width + "").match(/%/g) ? item.width : item.width + 'px' ) : 'auto';
                return (
                    <li key={ index } className={ className } style={{ width: width }} >{ item.title }</li>
                )
            })
        }
        if(columnsDom){
            columnsDom = (
                <ul>
                    { columnsDom }
                </ul>
            )
        }
        return columnsDom;
    };
    initData = (columns, data) => {
        if(!data){
            return null;
        }
        let dataDom = null;
        if(data.length > 0){
            dataDom = data.map( (item_i, index_i) => {
                let td = '';
                td = columns.map( (item_j, index_j) => {
                    let field = item_j["field"];
                    let value = item_i[field];
                    let width = item_j.width ? ( (item_j.width + "").match(/%/g) ? item_j.width : item_j.width + 'px' ) : "auto";
                    let className = item_j.class ? item_j.class : '';
                    if(item_j.type == 'date' && item_j.format && value){
                        value = this.formatDate(item_j.format, value);
                    }
                    if(typeof item_j.template === 'function'){
                        return (
                            <li className={ className } style={{ width: width }} key={ index_j }>{ item_j.template(item_i) }</li>
                        )
                    }
                    return (
                        <li className={ className } style={{ width: width }} key={ index_j }>{ value }</li>
                    )
                });
                return (
                    <ul onClick={ this.select.bind(this, item_i) } key={ index_i }>{ td }</ul>
                )
            });
        }
        return dataDom;
    };
    select = (obj, ev) => {
        ev = ev || window.event;
        ev.preventDefault();
        this.setState({
            model: obj
        });
        s(ev.currentTarget).siblings().removeClass('active');
        s(ev.currentTarget).addClass('active');
    };
    reload = () => {
        // 初始化参数传入load替换此方法
    };
    create = () => {
        this.state.create(this.state.model)
    };
    update = () => {
        if(!this.state.model){
            s.alert('请选择数据');
            return false;
        }
        this.state.update(this.state.model);
    };
    remove = () => {
        if(!this.state.model){
            s.alert('请选择数据');
            return false;
        }
        let _this = this;
        s.confirm({
            msg: '确定删除选中数据吗？',
            title:'系统消息',
            confirm:function(){
                _this.state.remove(_this.state.model);
            }
        });
    };
    load = (filter) => {
        let { index } = filter;
        index = index ? index : 1;
        this.setState({
            index: index,
            model: null
        }, () => {
            this.reload(filter);
            s(".grid-content ul").removeClass("active");
        });
    };
    changeIndex = (index) => {
        this.setState({
            index: index,
            model: null
        }, () => {
            s(".grid-content ul").removeClass("active");
        })
    };
    callMethod = (action, isSelect) => {
        if(isSelect === true){
            if(!this.state.model){
                s.alert('请选择数据');
                return false;
            }
        }
        if(typeof action === 'function'){
            action.call(this, this.state.model);
        }
    };
    componentDidMount = () => {
        let { toolbar, action, columns } = this.props;
        let toolbarDom = this.initToolbar(toolbar, action);
        let columnsDom = this.initColumns(columns);
        this.setState({
            toolbarDom: toolbarDom,
            columnsDom: columnsDom
        });
    };
    componentDidUpdate = () => { // 设置容器高度
        let containerHeight = document.getElementById("content").clientHeight;
        this.refs.container.style.height = (containerHeight - 96) + "px";
        this.refs.content.style.height = (this.refs.container.style.height - this.refs.head.style.height) + "px";
    };
    componentWillReceiveProps = nextProps => { // 新增、删除等操作加载数据后 页面状态重置
        if(nextProps.total !== this.state.total){
            this.setState({
                total: nextProps.total,
                model: null,
                index: 1
            }, () => {
                s(".grid-content ul").removeClass("active");
            });
        }
    };
    render = () => {
        let { toolbarDom, columnsDom } = this.state;
        let {  columns, data, total } = this.props;
        let dataDom = this.initData(columns, data);
        let pagerOption = { total: total, load: this.load, index: this.state.index, changeIndex: this.changeIndex };
        return (
            <div>
                <div className='grid'>
                    { toolbarDom }
                    <div className="grid-container" ref="container">
                        <div className='grid-head' ref="head">
                            { columnsDom }
                        </div>
                        <div className='grid-content' ref="content">
                            { dataDom }
                        </div>
                    </div>
                </div>
                <Pager { ...pagerOption } />
            </div>
        )
    }
}
export default Grid;