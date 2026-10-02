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

function get_median(arr){
    function sIncrease(i, ii) {
            if (i > ii)
                return 1;
            else if (i < ii)
                return -1;
            else
                return 0;
        }
        arr = arr.sort(sIncrease);
        if (arr.length%2 == 0){
            return ((arr[arr.length/2] + arr[arr.length/2 - 1])/2);
        }else
            return arr[Math.floor(arr.length/2)];  
}

function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}
// Norm: converts z-score to probability value (one-tailed).
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function Norm (z) {
	//z = Math.abs (z);
	var p = 1 + z * (0.04986735 + z * (0.02114101 + z * (0.00327763 + z * (0.0000380036 + z * (0.0000488906 + z * 0.000005383)))));
	p = p * p; p = p * p; p = p * p;
	return 1 / (2 * p * p);
}
//Calculate z-score and return p-value using function Norm(z).
function get_pvalue(sigma, mitt, x_mean, n){
    var z = (x_mean - mitt)*Math.sqrt(n)/sigma;
    return Norm(z);
}
// RN_Normal: Generates two values; a variable constructed of these values will
//   be normally distributed.  Based on Algorithm P from Knuth (1981).
//   Values are multiplied by sd and added to mean in the end to make the distribution have
//   the specified mean and standard deviation

function RN_Normal (mean, sd) {			
	var v1, v2, s;
	do {
		v1 = 2 * Math.random() - 1;
		v2 = 2 * Math.random() - 1;
	} while ((s = v1 * v1 + v2 * v2) >= 1);
	s = Math.sqrt ((-2 * Math.log(s)) / s);
	return v1 * s * sd + mean * 1.0;
}
// StatCom: utility function for StudT and FishF function
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function StatCom (q, i, j, b) {
	var zz = 1;
	var z = zz;
	var k = i;
	while (k <= j) { 
		zz = zz * q * k / (k - b);
		z = z + zz;
		k = k + 2 
	}
	return z;
}
// StudT: converts t statistic to probability value (one-tailed).
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function StudT (t, df) {
	t = Math.abs (t);
	var w = t / Math.sqrt (df);
	var th = Math.atan (w)
	if (df == 1) { 
		return (1 - th / (Math.PI / 2)) / 2;
	}
	var sth = Math.sin (th);
	var cth = Math.cos (th)
	if ((df % 2) == 1) { 
		return (1 - (th + sth * cth * StatCom (cth * cth, 2, df-3, -1)) / (Math.PI / 2)) / 2;
	} else { 
		return (1 - sth * StatCom (cth * cth, 1, df-3, -1)) / 2;
	}
}

// AStudT: converts from probability value (one-tailed) to t statistic		
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function AStudT (p, df) { 
	var v = 0.5;
	var dv = 0.5;
	var t = 0
	while (dv > 1e-6) {
		t = 1 / v - 1;
		dv = dv / 2;
		if (StudT (t, df) > p) { 
			v = v - dv; 
		} else { 
			v = v + dv 
		} 
	}
	return t;
}
//Get int random value between min and max
function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//Get float random value between min and max
function getRandomFloat(min, max)
{
     return parseFloat(Math.min(min + (Math.random() * (max - min)),max));
}

function get_mean(arr){
    var sum = 0;
    for(var i = 0; i < arr.length; i++)
        sum += arr[i];
    return sum / arr.length;
}

function get_standart_deviation(arr){
    var mean = get_mean(arr);
    var sum = 0;
    var n = arr.length;
    for(var i = 0; i < n; i++){
        sum += Math.pow((mean - arr[i]), 2);
    }
    return Math.sqrt(sum/(n - 1));    
}

function get_variance(arr){
    var mean = get_mean(arr);
    var sum = 0;
    for(var i = 0; i < arr.length; i++){
        sum = sum + Math.pow((arr[i] - mean), 2);
    }
    return sum / arr.length;
}

// FishF: converts F statistic to probability value
// Adapted from "LiveScript" code at http://members.aol.com/johnp71/pdfs.html ("JavaStat")
function FishF (f, dfb, dfe) {
	var PiD2 = Math.PI / 2;

	var x = dfe / (dfb * f + dfe);
	
	if ((dfb % 2) == 0) { 
		return StatCom (1 - x, dfe, dfb + dfe - 4, dfe - 2) * Math.pow (x, dfe / 2);
	}
	
	if ((dfe % 2) == 0) {
		return 1-StatCom (x, dfb, dfb + dfe - 4, dfb - 2) * Math.pow (1 - x, dfb / 2);
	}
	
	var th = Math.atan (Math.sqrt (dfb * f / dfe));
	var a = th / PiD2;
	var sth = Math.sin (th);
	var cth = Math.cos (th);

	if (dfe > 1) {
		a = a + sth * cth * StatCom (cth * cth, 2, dfe - 3, -1) / PiD2;
	}
	
	if (dfb == 1) {
		return 1-a;
	}
	
	var c = 4 * StatCom (sth * sth, dfe + 1, dfb + dfe - 4, dfe - 2) * sth * Math.pow (cth, dfe) / Math.PI;
	if (dfe == 1) {
		return 1 - a + c / 2;
	}
	var k = 2;
	while (k <= (dfe - 1) / 2) {
		c = c * k / (k - .5);
		k = k + 1;
	}

	return 1 - a + c;
}


