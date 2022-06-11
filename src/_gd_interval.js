'use strict';

//INTERVAL CALSS TO USE IN _gd_sandbox_editor.js
// use only positive integer
class _gd_interval{
    constructor(start = -1, end = -1){
            
        this.start = start;
        this.end = end;
        if(start > end){
            this.start = end;
            this.end = start;
        }
        this.id = "" + start + "" + end;
    }

    has_intersection_with(interval){
        
        if(interval.start <= this.start && this.start <= interval.end || this.start <= interval.start && interval.start <= this.end)
            return true;
        
        return false;
    }

    contains_interval(interval){
        if(this.start <= interval.start && this.end >= interval.end)
            return true;
        
        return false;
    }

    combine_interval(interval){
        if(interval.start < this.start)
            this.start = interval.start;
        
        if(interval.end > this.end)
            this.end = interval.end;
    }
    
    //change the calling interval
    //make this interal into a intersection of itself and the interval passed as argument
    intersect_interval(interval){
        if(this.has_intersection_with(interval)){
            if(interval.start > this.start)
                this.start = interval.start;
            
            if(interval.end < this.end)
                this.end = interval.end;
        }
    }

    //returns the interval in witch this interval intersect with the passed interval or undefined if there is no intersection
    get_intersection_interval(interval){
        if(this.has_intersection_with(interval)){
            let start = this.start;
            let end = this.end;

            if(interval.start > start)
                start = interval.start;
            
            if(interval.end < end)
                end = interval.end;
            
            return new _gd_interval(start, end);
        }

        
        return undefined;
    }
    
    
    //Intervals should be ordered by their start value.
    nested_interval_range_from_interval_list(intervalArray = _2_test_inntervalArray){
        let nested_Interval_Array = [];
        intervalArray.forEach((interval, index, intervalArray) => {
            nested_Interval_Array.push([]);
            nested_Interval_Array[index] = [interval.start,[]];
        });

    }
    //CHECKS FIRST AND TRHOWS ERROR IF NOT ORDERED as asked
    nested_interval_range_from_interval_list_CHECK(intervalArray){

    }
    
}

/*
description before i forget what i did: _[number]_test_inntervalArray_result_after_nested___ 
is the result of _[number]_test_inntervalArray passing through the function: nested_interval_range_from_interval_list

and huh... i have a png of what _2_test_inntervalArray represent it should be easy that way:
in the help folder : "nested interval array.png"

the function : nested_interval_range_from_interval_list should only produce a "slim" array:

_2_slim_test_inntervalArray_result_after_nested___ and NOT _2_test_inntervalArray_result_after_nested___

*/

const _1_test_inntervalArray = [new _gd_interval(1,5), new _gd_interval(3,9),];
const _1_test_inntervalArray_result_after_nested___ = [
    [1,[1]],
    [3,[1,1,2]],
    [5,[2,1,2]],
    [9,[2]],
];

const _2_test_inntervalArray = [new _gd_interval(0,25), new _gd_interval(5,15), new _gd_interval(7,22), new _gd_interval(11,14),];
const _2_test_inntervalArray_result_after_nested___ = [
    [0,[1]],
    [5,[1,1,2]],
    [7,[2,1,1,2,3]],
    [11,[3,2,1,1,2,3,4]],
    [14,[4,3,2,1,1,2,3]],
    [15,[3,2,1,1,3]],
    [22,[3,1,1]],
    [25,[1]],
];
const _2_slim_test_inntervalArray_result_after_nested___ = [
    [0,[1]],
    [5,[2]],
    [7,[3]],
    [11,[4]],
    [14,[4]],
    [15,[3,2,3]],
    [22,[3]],
    [25,[1]],
];