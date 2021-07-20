'use strict';

class _gd_event{
    constructor(){

        this.eventNameList = new Map();
        //this.makeEventObject = this.makeEventObject.bind(this);
    }

    addEventListener(name, callFunction){
        if(this.eventNameList.has(name)){
            this.eventNameList.get(name).callFunctionList.add(callFunction);
        }
    }
    removeEventListener(name, callFunction){
        if(this.eventNameList.has(name)){
            this.eventNameList.get(name).callFunctionList.delete(callFunction);
        }
    }

    __addEventType(name, eventObjectNameArray){
        this.eventNameList.set(name, {eventObjectNameArray: eventObjectNameArray, callFunctionList: new Set()});
    }

    dispatchEvent(eventName){
        let cach;
        if(this.eventNameList.has(eventName)){

            cach = this.eventNameList.get(eventName);
            //debugger;
            cach.callFunctionList.forEach(callFunction => callFunction(this.makeEventObject(cach.eventObjectNameArray)) );
            return;
        }
        throw new Error("dispatchEvent(eventName)  eventName not found");
    }

    makeEventObject(eventObjectNameArray){
        let eventObj = {};
        eventObjectNameArray.forEach(name => eventObj[name] = this[name]);

        return eventObj;
    }

}
