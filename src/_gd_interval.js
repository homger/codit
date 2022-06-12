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
        this.id = null;
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
    //
    static nested_interval_range_from_interval_list(intervalArray = _2_test_inntervalArray){
        let nested_Interval_Array = [];
        let nested_Interval_Map = new Map();
        let intervalArray_length = intervalArray.length;
        //let openCloseArray = [];
        let openCloseArray = new Map();
        let autoStackArray = new First_In_First_Out_Stack();
        let transferAuTostack = new First_In_First_Out_Stack();

        /*let min = intervalArray[0].start;
        let max; intervalArray.forEach((interval, index) => {
            if(index = 0) 
                max = interval.end;
            if(max < interval.end)
                max = interval.end;
        });*/
        for(let i = 0; i < intervalArray_length; ++i){
        }
        intervalArray.forEach((interval, index) => {
            interval.id = index + 1;
            //openCloseArray.push([false, interval.id]);
            openCloseArray.set(interval.id, [false, interval.id]);
            if(nested_Interval_Map.has(intervalArray[index].start)){
                nested_Interval_Map.get(intervalArray[index].start).push(interval.id);
            }
            else{
                nested_Interval_Map.set(intervalArray[index].start, [interval.id]);
            }

            if(nested_Interval_Map.has(intervalArray[index].end)){
                nested_Interval_Map.get(intervalArray[index].end).push(interval.id);
            }
            else{
                nested_Interval_Map.set(intervalArray[index].end, [interval.id]);
            }

        });
        
        let sorted_by_keys_nested_Interval_Array = Array.from(nested_Interval_Map).sort(function(a,b){
            if(a[0] < b[0]){
                return -1;
            }
            if(a[0] > b[0]){
                return 1;
            }
            return 0;
        });

        /*nested_Interval_Map.forEach((idArray, key) => {

            let open_close_action_array = [];
            idArray.forEach(id => {
                console.log("id : " + id);
                if(!openCloseArray[id][0]){
                    openCloseArray[id][0] = true;
                    open_close_action_array.push(id);
                }
                else{
                    openCloseArray[id][0] = false;
                    open_close_action_array.push(id);
                }
            });

            nested_Interval_Array.push([key,open_close_action_array]);
        });*/

        sorted_by_keys_nested_Interval_Array.forEach((changeIntervalPoint, index) => {
            
            let open_action_array = [];
            let close_action_array = [];            
            changeIntervalPoint[1].forEach(intervalId => {

                if(openCloseArray.get(intervalId)[0] === false){
                    openCloseArray.get(intervalId)[0] = true;
                    autoStackArray.add(intervalId);
                    open_action_array.push(intervalId);
                }
                else if(openCloseArray.get(intervalId)[0] === true){
                    openCloseArray.get(intervalId)[0] = false;
                    
                    //transferAuTostack.transferAll(autoStackArray);
                    if(autoStackArray.has(intervalId)){

                        autoStackArray.transferUntilValueFound(intervalId, transferAuTostack);
                        transferAuTostack.add(autoStackArray.remove());
                        
                    }
                    
                }
                else{
                    throw new Error("Wrong data : openCloseArray[intervalId]   : "  +  openCloseArray.get(intervalId)[0]);
                }
            });

            let open_close_action_array = [];
            let reopen_action_array = [];
            /*let idCach = transferAuTostack.remove();
            while(idCach !== undefined){
                open_close_action_array.push(idCach);
                if(openCloseArray[idCach][0]){
                    autoStackArray.add(idCach);
                    reopen_action_array.push(idCach);
                }
                idCach = transferAuTostack.remove();
            }*/
            console.log("Stack array :  " + autoStackArray.stackArray);
            transferAuTostack.foreEach((id) => {
                
                open_close_action_array.push(id);
                /*if(openCloseArray[id][0]){
                    autoStackArray.add(id);
                    reopen_action_array.push(id);
                }*/
            });
            transferAuTostack.foreEach_REVERSE(id => {
                transferAuTostack.remove();
                if(openCloseArray.get(id)[0]){
                    autoStackArray.add(id);
                    reopen_action_array.push(id);
                }
            });

            
            nested_Interval_Array.push([changeIntervalPoint[0], open_close_action_array.concat(reopen_action_array, open_action_array)]);
        });
        /*let sorted_by_keys_nested_Interval_Map = nested_Interval_Map.keys();
        
        sorted_by_keys_nested_Interval_Map.sort().forEach(key => {
            let idArray = nested_Interval_Map.get(key);

            let open_close_action_array = [];
            idArray.forEach(id => {
                console.log("id : " + id);
                if(!openCloseArray[id][0]){
                    openCloseArray[id][0] = true;
                    open_close_action_array.push(id);
                }
                else{
                    openCloseArray[id][0] = false;
                    open_close_action_array.push(id);
                }
            });

            nested_Interval_Array.push([key,open_close_action_array]);

        });*/

        return nested_Interval_Array;
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




//FOR _gs_interval
// THE
class First_In_First_Out_Stack{
    constructor(){
        this.stackArray = [];
        this.length = 0;
    }
    foreEach_REVERSE(callBack){
        let i = this.length - 1;
        while(i >= 0){
            callBack(this.stackArray[i], i, this.stackArray);
            --i;
        }
    }
    foreEach(callBack){
        let i = 0;
        while(i < this.length){
            callBack(this.stackArray[i], i, this.stackArray);
            ++i;
        }
    }
    has(value){
        return this.stackArray.includes(value);
    }
    // Wil NOT add undefined as a value 
    add (value){
        if(value === undefined)
            return;
        this.stackArray.push(value);
        ++this.length;
    }
    remove (){
        if(this.length === 0){
            return undefined;
        }
        --this.length;
        return this.stackArray.pop();
    }
    viewTop (){
        return this.stackArray[this.length - 1];
    }
    //does not transfer value
    transferUntilValueFound (value, First_In_First_Out_Stack_Object, callBackFunction = undefined){

        if(callBackFunction !== undefined){
            while(this.viewTop() !== value && this.length > 0){
                callBackFunction(this);
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
        else{
            while(this.viewTop() !== value && this.length > 0){
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
    }
    transferAll (First_In_First_Out_Stack_Object,  callBackFunction = undefined){
        if(callBackFunction !== undefined){
            while(this.length > 0){
                callBackFunction(this);
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
        else{
            while(this.length > 0){
                First_In_First_Out_Stack_Object.add(this.remove());
            }
        }
    }
    
}
