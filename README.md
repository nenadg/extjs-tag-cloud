# extjs-tag-cloud

Credits for the work to people @ https://xp-dev.com/trac/catalog/browser/catalog/CompaniesModule/web-app/js/extjs/ux/Ext.ux.TagCloud.js
I've just modified constructor to accept store as array of tags.

## usage
Just add something like this to your constructor tree:
```javascript
  {
   xtype: 'tagcloud',
   store: ['education','financial', 'computer', 'application', 'online education', 'degree', 'college', 'capture', 'school', 'online degree', 'online', 'private education', 'education', 'education','education', 'education','education', 'education', 'financial', 'financial', 'financial', 'financial', 'computer', 'online', 'online', 'online', 'education'],
   listeners: {
     tagselect: function(tagcloud, record){
       // whatever
     }
   }
  }
```
