function Viewer()
{
	
}

Viewer.prototype.GetRandomTag = function()
{
	var request = new XMLHttpRequest();
	var data = "http://000000book.com/data/random.json";
	request.open('GET', data, true);
	request.onreadystatechange = function() 
	{
	    if (request.readyState === 4) {
	        console.log(request.responseText);
	    }
	};
	request.setRequestHeader('Content-type', 'application/json');
	request.send();
	return data;
}

Viewer.prototype.RenderTag = function()
{
	d3.json(this.GetRandomTag(), function(data)
	{
		console.log(data);
	});
}