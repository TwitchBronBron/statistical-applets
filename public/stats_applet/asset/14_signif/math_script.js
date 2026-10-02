//arrays of data

var Xmas = new Array();
var Ymas = new Array();
var Rmas = new Array();

//calculate mean X

function get_mean_X(){
    var sum = 0;
    for(var i = 0; i < Xmas.length; i++)
        sum += Xmas[i];
    return sum / Xmas.length;
}

//calculate mean Y

function get_mean_Y(){
    var sum = 0;
    for(var i = 0; i < Ymas.length; i++)
        sum += Ymas[i];
    return sum / Ymas.length;
}

//calculate standart deviation for X

function get_Sx(){
    var sum = 0;
    var mX = get_mean_X();
    for(var i = 0; i < Xmas.length; i++)
        sum += Math.pow(Xmas[i] - mX, 2);
    return sum / (Xmas.length - 1);
}

//calculate standart deviation for Y

function get_Sy(){
    var sum = 0;
    var mY = get_mean_Y();
    for(var i = 0; i < Ymas.length; i++)
        sum += Math.pow(Ymas[i] - mY, 2);
    return sum / (Ymas.length - 1);
}

//calculate correlation

function get_r(){
    var Sx = Math.sqrt(get_Sx());
    var mX = get_mean_X();
    var Sy = Math.sqrt(get_Sy());
    var mY = get_mean_Y();
    var sum = 0;
    for(var i = 0; i < Xmas.length; i++)
        sum += ((Xmas[i] - mX) / Sx) * ((Ymas[i] - mY) / Sy);
    return sum / (Xmas.length - 1);
}

//calculate b-coefficient of least-squares line

function get_b(){
    return get_r() * Math.sqrt(get_Sy()) / Math.sqrt(get_Sx());
}

//calculate a-coefficient of least-squares line

function get_a(b){
    return get_mean_Y() - b * get_mean_X();
}

//calculete a-coefficient of residual line from point (x, y)

function get_res_line_a(b, x, y){
    return y - b * x;
}

//calculete X coordinate of cross-point of least-squares line and residual line from point (x, y)

function get_cross_x(x, y){
    var b = get_b();
    var a = get_a(b);
    var an = get_res_line_a(-1 / b, x, y);
    return (an - a) / (b + 1 / b);
}

function get_border_x(){
    var tmax = Xmas[0];
    var tmin = Xmas[0];
    for(var i = 0; i < Xmas.length; i++){
        if(Xmas[i] > tmax)
            tmax = Xmas[i];
        if(Xmas[i] < tmin)
            tmin = Xmas[i];
    }
    return {
        min : tmin,
        max : tmax
    }
}

function get_border_y(){
    var tmax = Ymas[0];
    var tmin = Ymas[0];
    for(var i = 0; i < Ymas.length; i++){
        if(Ymas[i] > tmax)
            tmax = Ymas[i];
        if(Ymas[i] < tmin)
            tmin = Ymas[i];
    }
    return {
        min : tmin,
        max : tmax
    }
}

function calculate_res_x(){
    Rmas = new Array();
    var b = get_b();
    var a = get_a(b);
    for(var i = 0; i < Xmas.length; i++){
        var y = b * Xmas[i] + a;
        var r = Ymas[i] - y;
        Rmas.push(r);
    }
}

function get_border_r(){
    var tmin = Rmas[0];
    var tmax = Rmas[0];
    for(var i = 0; i < Rmas.length; i++){
        if(Rmas[i] > tmax)
            tmax = Rmas[i];
        if(Rmas[i] < tmin)
            tmin = Rmas[i];
    }
    return {
        min : tmin,
        max : tmax
    }
}

function get_sum_X(){
    var sum = 0;
    for(var i = 0; i < Xmas.length; i++)
        sum+= Xmas[i];
    return sum;
}

function get_median_X(){
    var mas = Xmas.slice(0);
    var i;
    for(i = mas.length - 1; i > 0; i--)
        for(var j = 0; j < i; j++)
            if(mas[j] > mas[j + 1]){
                var tmp = mas[j];
                mas[j] = mas[j + 1];
                mas[j + 1] = tmp;
            }
    if(mas.length % 2) {
            i = Math.floor(mas.length / 2);
            return mas[i];
    } else {
        i = mas.length / 2;
        return (mas[i] + mas[i - 1]) / 2;
    }
}

function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}

function get_pvalue(sigma, mitt, x_mean, n){
    var z = (x_mean - mitt)*Math.sqrt(n)/sigma;
    z = Math.abs (z);
	var p = 1 + z * (0.04986735 + z * (0.02114101 + z * (0.00327763 + z * (0.0000380036 + z * (0.0000488906 + z * 0.000005383)))));
	p = p * p; p = p * p; p = p * p;
	return 1 / (2 * p * p);    
}

function RN_Normal (mean, sd) {			
	var v1, v2, s;
	do {
		v1 = 2 * Math.random() - 1;
		v2 = 2 * Math.random() - 1;
	} while ((s = v1 * v1 + v2 * v2) >= 1);
	s = Math.sqrt ((-2 * Math.log(s)) / s);
	return v1 * s * sd + mean * 1.0;
}

// Norm: converts z-score to probability value (one-tailed).
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function Norm (z) {
	z = Math.abs (z);
	var p = 1 + z * (0.04986735 + z * (0.02114101 + z * (0.00327763 + z * (0.0000380036 + z * (0.0000488906 + z * 0.000005383)))));
	p = p * p; p = p * p; p = p * p;
	return 1 / (2 * p * p);
}

// ANorm: converts from probability value (one-tailed) to z-score
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function ANorm(p) {
	var v = 0.5;
	var dv = 0.5;
	var z = 0
	while (dv > 1e-6) { 
		z = 1 / v - 1; 
		dv = dv / 2; 
		if (Norm (z) > p)
			v = v - dv
		else
			v = v + dv 
	}
	return z
}
