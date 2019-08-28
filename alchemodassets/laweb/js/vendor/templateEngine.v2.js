(function(){
  this.templateEngine = function tmpl(str, data){
    var strFunc =
              "var p=[];" +
                          "with(obj){p.push('" +
  
              str.replace(/[\r\t\n]/g, " ")
                 .replace(/'(?=[^%]*%>)/g, "\t")
                 .split("'").join("\\'")
                 .split("\t").join("'")
                 .replace(/<%=(.+?)%>/g, "',$1,'")
                 .split("<%").join("');")
                 .split("%>").join("p.push('")
                 + "');}return p.join('');";
  
              var fn = new Function("obj", strFunc);
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();