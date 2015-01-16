function getProp(name) {
  return function (object) { return object[name] }
}
function computeProp(name, f){
    return function (object) { object[name] = f(object) }
}

function each(type, f){
    return this.map(function(currentValue, index, array){
        if(typeof(currentValue) == type)
            return f(currentValue, index, array)
        else
            return currentValue
    })
}

function eachWith(type, prop, f)
{
    return this.map(function(currentValue, index, array){
        if(typeof(currentValue) == type && currentValue[prop])
            return f(currentValue, index, array)
        else
            return currentValue
    })
}

// String tools
Array.prototype.strings = function() {
    this.strings.each = each.bind(this, "string")
    res = this.filter(function(x){
        return typeof(x) == "string"
    })
    
    return res
}

/*

 //Test Cases
arr = ["StringOne", {name:"distance", x:3, y:3, dist:4.242640687119285}, {name:"distance", x:2, y:2},{name:"distance", x:5, y:5}]
arr.strings()

arr = arr.strings.each(function(x){
    return x.length
})

console.log(arr)

*/

// Object tools

Array.prototype.objects = function() {
    this.objects.each = each.bind(this, "object")
    this.objects.eachWith = eachWith.bind(this, "object")
    res = this.filter(function(x){
        return typeof(x) == "object"
    })
    
    return res
}
/*
Array.prototype.objectsWith = function(prop){
    this.objects.self = this
    res = this.filter(function(x){
        return typeof(x) == "object" && !!x[prop]
    })
    return res
}

arr.objects()

getX = getProp('x')
getY = getProp('y')

distance = computeProp('dist', function(o){
    x = getX(o)
    y = getY(o)
    return Math.sqrt(x*x+y*y)
}) 
arr.objects.each(distance)
console.log(arr)

arr.objects.eachWith('dist', function(x){
    console.log(x.dist)
})
*/




