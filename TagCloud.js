/* 
 * Based on https://xp-dev.com/trac/catalog/browser/catalog/CompaniesModule/web-app/js/extjs/ux/Ext.ux.TagCloud.js
 */
Ext.define('Ext.TagCloud', {
	extend: 'Ext.Component',
	alias: 'widget.tagcloud',

	defaultAutoCreate : {tag: "div", cls: "x-cloud"},
	
	getDataSource : function(){
		return this.store;
	},

	constructor: function(cfg){

		cfg.displayField = cfg.displayField || 'tag';
		cfg.weightField = cfg.weightField || 'count';
		cfg.nodes = [];

		if(Ext.isArray(cfg.store)){

			var storeData = cfg.store, data = [];

			for(var i in storeData){
				var obj = {},
					raise = data.filter(function(field){
						if(field[cfg.displayField] == storeData[i])
							return field;
					});

				if(raise.length){
					
					var field = data[data.indexOf(raise[0])];
					field[cfg.weightField]++;
					continue;
				} 
				
				Object.defineProperty( obj, cfg.displayField, {
					value: storeData[i],
					writable: true,
					sealed: false,
					enumerable: true,
					configurable: true
				});

				Object.defineProperty( obj, cfg.weightField, {
					value: 1,
					writable: true,
					sealed: false,
					enumerable: true,
					configurable: true
				});

				data.push(obj);
			}
			
			cfg.store = Ext.create('Ext.data.JsonStore', {
				fields: cfg.displayField,
				data: data
			});
		}

		Ext.apply(this, cfg);
		this.callParent(arguments);
	},
	
	/*
	 * Sets the store for this cloud
	 * @param {Ext.data.Store} store the store to set
	 */
	setStore : function(store){
		
		// when the store is loaded, automatically refresh the cloud
		store.on('load', this.refresh, this);
		this.store = store;
		// sort alphabetically
		this.store.remoteSort = false;
		this.store.sort(this.displayField, 'ASC');
	},

	// private
	onRender : function(ct, position){  
		
		this.container = ct;
		

		if(this.el){
			this.el = Ext.get(this.el);
			if(!this.target){
				ct.dom.appendChild(this.el.dom);
			}
		} else {
			var cfg = this.getAutoCreate();
			if(!cfg.name){
				cfg.name = this.name || this.id;
			}
			this.el = ct.createChild(cfg, position);
		}
		
		this.list = this.el.createChild({tag: "ol", cls: "x-cloud-ordered-list"});
		this.callParent(arguments);

		this.refresh();
		
	},

	// private
	refresh : function(){
		
		/* First, remove all children */
		this.clearNodes();
		
		/* Determine the spread values */
		this.getWeightDistribution();
		
		var records = this.store.getRange();

		for(var i=0; i < records.length; i++){

			var count = records[i].data[this.weightField];
		   
			var child = this.list.createChild({
				tag: "li", 
				cls: "x-cloud-item "+this.getWeightClassification(count),
				html: '<span class="tag-span">'+records[i].data[this.displayField]+(this.displayWeight ? ' ('+count+')' : '')+'</span>'
				});
			
			child.on('click', this.onSelect, this);
			
		}
		
		/* Fade the list in */
		this.list.fadeIn(
			{
			duration:0.5,
			block:true
			}
		);
		
		/* Store a list of all child nodes */
		this.nodes = this.list.dom.childNodes;
		
	},
	

	clearNodes : function(){
		while (this.list.dom.firstChild){
			this.list.dom.removeChild(this.list.dom.firstChild);
		}
	},

	onSelect : function(e, t){
	
		var item = t.parentNode;
		var index = this.indexOf(item);
		
		/* Remove from selection from any selected children */
		var selected = this.list.query('.x-cloud-item-selected');
		if(selected.length > 0)
			Ext.get(selected[0]).removeClass('x-cloud-item-selected');
		
		this.fireEvent('tagselect', this, this.getDataSource().getAt(index), index);
		
		//create event object if not exists
		if( Ext.isEmpty( Ext.EventObject ) === true ){
			
			Ext.EventObject = new Ext.EventObjectImpl(e);
		}//if..
		
		// Prevent the link href from being followed
		Ext.EventObject.stopEvent(e);
	},
	
	indexOf : function(node){
		var ns = this.nodes;
		for(var i = 0, len = ns.length; i < len; i++){
			if(ns[i] == node){
				return i;
			}
		}
		return -1;
	},

	getWeightClassification : function(weight){

		if(weight == this.max)
			return 'largest';
		if(weight == this.min)
			return 'smallest';
		if(weight > (this.min + (this.distribution*2)))
			return 'large';
		if(weight > (this.min + this.distribution))
			return 'medium';

		return 'small';
	},

	getWeightDistribution : function(){
	
		var records = this.store.getRange();
		if(records.length==0){
			this.max = this.min = 0;
			return;
		}
		
		this.max = records[0].data.count;
		this.min = records[0].data.count;

		for(var i=0; i < records.length; i++){
			var count = records[i].data[this.weightField];
			if(count > this.max){
				this.max = count;
			}
			if(count < this.min){
				this.min = count;
			}
		}

		if(!this.distribution)
			this.distribution = (this.max - this.min) / 5;
	}
});
