
var cpiFlare = {};
var cpi;

function pageIsLoaded() {
	uiInit();
	d3ProjectInit();
}

function uiInit() {

}

// project initialization function
function d3ProjectInit() {
	queue(1)
		.defer(d3.csv, "data/cpi2015.csv")
		.await(convert)
}

function convert(error, csv) {
    csv.forEach(function(d) {
        cpiFlare[d.ID] = d;
        if ("Parent" in d && d.Parent>=0)  {
        var parent = cpiFlare[d.Parent];

        if (parent.children) parent.children.push(d);
        else parent.children = [d];
    }
    });

    D3WRAP.ZoomableSunburst("#chart1", cpiFlare[0], {});
}
