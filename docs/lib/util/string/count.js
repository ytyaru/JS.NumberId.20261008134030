String.prototype.count = function(regexStr='\n') { return (this.match(new RegExp(regexStr, 'g')) || []).length; }
