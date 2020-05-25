import React, { Component } from "react";

export default class BoundingBox extends Component {

constructor(props){
  super(props);
  this.state ={
    contents: [],
    contentsDetections: [],
    localOnSelect: {
        "CAM_FRONT_LEFT": function (index) {
        },
        "CAM_FRONT": function (index) {
        },
        "CAM_FRONT_RIGHT": function (index) {
        },
        "CAM_BACK_RIGHT": function (index) {
        },
        "CAM_BACK": function (index) {
        },
        "CAM_BACK_LEFT": function (index) {
        },
        "PCD": function (index) {
        }
    },
    onSelect: function (dataType, f) {
        this.localOnSelect[dataType] = f;
    },
    localOnChangeClass:{
        "CAM_FRONT_LEFT": function (index, label) {
        },
        "CAM_FRONT": function (index, label) {
        },
        "CAM_FRONT_RIGHT": function (index, label) {
        },
        "CAM_BACK_RIGHT": function (index, label) {
        },
        "CAM_BACK": function (index, label) {
        },
        "CAM_BACK_LEFT": function (index, label) {
        },
        "PCD": function (index, label) {
        }
    },
  };
  }

  onChangeClass(dataType, f){
      this.localOnChangeClass[dataType] = f;
  }

  onRemove(dataType){

  }

  get(index, channel){
    if (this.contents[index] === undefined) {
        return undefined;
    }
    if (channel === undefined) {
        return this.contents[index];
    }
    return this.contents[index][channel];
  }

  set(insertIndex, params){
    let obj = get3DLabel(params);
    if (this.contents[params.fileIndex][insertIndex] === undefined) {
        this.contents[params.fileIndex].push(obj);
    } else {
        this.contents[params.fileIndex][insertIndex] = obj;
    }
    this.contents[params.fileIndex][insertIndex]["class"] = params.class;
    this.contents[params.fileIndex][insertIndex]["interpolationStart"] = params["interpolationStart"];
    this.contents[params.fileIndex][insertIndex]["interpolationStartFileIndex"] = params.interpolationStartFileIndex;
    this.contents[params.fileIndex].insertIndex = insertIndex;
    if (params.fromFile === false && this.__selectionIndexCurrentFrame === -1) {
        if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
            this.contents[params.fileIndex][insertIndex]["trackId"] = classesBoundingBox.content[params.class].nextTrackId;
        } else {
            this.contents[params.fileIndex][insertIndex]["trackId"] = classesBoundingBox[params.class].nextTrackId;
        }
    } else {
        this.contents[params.fileIndex][insertIndex]["trackId"] = params.trackId;
    }
    this.contents[params.fileIndex][insertIndex]["channels"] = params.channels;
    this.contents[params.fileIndex][insertIndex]["fileIndex"] = params.fileIndex;
    this.contents[params.fileIndex][insertIndex]["copyLabelToNextFrame"] = params.copyLabelToNextFrame;
  }

  changeClass(selectedObjectIndex, newClassLabel){
    if (this.contents[this.state.currentFileIndex][selectedObjectIndex] === undefined) {
        return false;
    }

    // return if same class was chosen again
    let currentClassLabel = classesBoundingBox.getCurrentClass();
    if (currentClassLabel === newClassLabel) {
        return false;
    }


    // update id of sprite
    let currentTrackId = this.contents[this.state.currentFileIndex][selectedObjectIndex]["trackId"];
    let spriteElem = $("#class-" + this.contents[this.state.currentFileIndex][selectedObjectIndex]["class"].charAt(0) + currentTrackId);
    // use original track id if original class selected
    let nextTrackIdNewClass;
    if (newClassLabel === this.contents[this.state.currentFileIndex][selectedObjectIndex]["original"]["class"]) {
        nextTrackIdNewClass = this.contents[this.state.currentFileIndex][selectedObjectIndex]["original"]["trackId"]
    } else {
        nextTrackIdNewClass = classesBoundingBox[newClassLabel]["nextTrackId"];
    }

    $(spriteElem).attr("id", "class-" + newClassLabel.charAt(0) + nextTrackIdNewClass).attr("background", "rgba(255, 255, 255, 0.8)");

    // update background color of sprite
    $($(spriteElem)[0]).css("background", classesBoundingBox[newClassLabel].color);

    // update class label
    this.contents[this.state.currentFileIndex][selectedObjectIndex]["class"] = newClassLabel;

    // update track id
    this.contents[this.state.currentFileIndex][selectedObjectIndex]["trackId"] = nextTrackIdNewClass;
    // decrease track id of current (previous) class
    classesBoundingBox[currentClassLabel]["nextTrackId"] = classesBoundingBox[currentClassLabel]["nextTrackId"] - 1;
    // increase track id of new class
    classesBoundingBox[newClassLabel]["nextTrackId"] = classesBoundingBox[newClassLabel]["nextTrackId"] + 1;

    // update text of sprite
    $($(spriteElem)[0]).text(newClassLabel.charAt(0) + nextTrackIdNewClass + " | " + newClassLabel);
    // update name of sprite
    labelTool.spriteArray[this.state.currentFileIndex][selectedObjectIndex].name = "sprite-" + newClassLabel.charAt(0) + nextTrackIdNewClass;

    // update class of folder and track id instead of creating new folder
    folderBoundingBox3DArray[selectedObjectIndex].domElement.children[0].children[0].innerHTML = newClassLabel + ' ' + nextTrackIdNewClass;
    //                                                           ul        number      div       div[class c]    input
    folderBoundingBox3DArray[selectedObjectIndex].domElement.children[0].children[3].children[0].children[1].children[0].value = nextTrackIdNewClass;

    // open current folder
    folderBoundingBox3DArray[selectedObjectIndex].open();
    folderPositionArray[selectedObjectIndex].open();
    folderSizeArray[selectedObjectIndex].open();
    // update name of selected object
    labelTool.selectedMesh.name = "cube-" + newClassLabel.charAt(0) + nextTrackIdNewClass;
    for (let channelObj in labelTool.camChannels) {
        if (labelTool.camChannels.hasOwnProperty(channelObj)) {
            let channelObject = labelTool.camChannels[channelObj];
            this.localOnChangeClass[channelObject.channel](selectedObjectIndex, newClassLabel);
        }
    }
    this.localOnChangeClass["PCD"](selectedObjectIndex, newClassLabel);
    let classPickerElem = $('#class-picker ul li');
    classPickerElem.css('background-color', '#353535');
    $(classPickerElem[classesBoundingBox[newClassLabel].index]).css('background-color', '#525252');
  }

  getSelectedBoundingBox(){
      if (this.__selectionIndexCurrentFrame === -1 || this.contents[this.state.currentFileIndex][this.__selectionIndexCurrentFrame] === undefined) {
          return undefined;
      } else {
          return this.contents[this.state.currentFileIndex][this.__selectionIndexCurrentFrame];
      }
  }

  setSelectionIndex(selectionIndex, channel){
      // show bounding box highlighting
      this.__selectionIndexCurrentFrame = selectionIndex;
      if (selectionIndex !== -1) {
          this.localOnSelect[channel](selectionIndex);
          return true;
      } else {
          return false;
      }
  }
  
  select(objectIndex, channel){
      this.setSelectionIndex(objectIndex, channel);
      this.localOnSelect["PCD"](objectIndex);
  }

  getSelectionIndex(){
      return this.__selectionIndexCurrentFrame;
  }

  selectEmpty(){
      this.setSelectionIndex(-1, undefined);
  }

  remove(index){
      // remove 3d object
      labelTool.removeObject("cube-" + this.contents[this.state.currentFileIndex][index]["class"].charAt(0) + this.contents[this.state.currentFileIndex][index]["trackId"]);
      // remove 2d object
      remove(index);
      delete this.contents[this.state.currentFileIndex][index];
      this.contents[this.state.currentFileIndex].splice(index, 1);
      delete labelTool.cubeArray[this.state.currentFileIndex][index];
      labelTool.cubeArray[this.state.currentFileIndex].splice(index, 1);
      this.__insertIndex--;
      this.select(-1, undefined);
  }

  removeSelectedBoundingBox(){
      this.remove(this.__selectionIndexCurrentFrame);
  }

  clear(){
      for (let j = 0; j < this.contents.length; j++) {
          for (let i = 0; i < this.contents[j].length; i++) {
              labelTool.removeObject("cube-" + this.contents[j][i]["class"].charAt(0) + this.contents[j][i]["trackId"]);
          }
      }

      this.__selectionIndexCurrentFrame = -1;
      this.__selectionIndexNextFrame = -1;
      this.__insertIndex = 0;
      this.contents[this.state.currentFileIndex] = [];
  }

  // __selectionIndexCurrentFrame: -1,
  // __selectionIndexNextFrame: -1,
  // __insertIndex: 0


  drawLine(channelIdx, pointStart, pointEnd, color){
    if (pointStart !== undefined && pointEnd !== undefined && isFinite(pointStart.x) && isFinite(pointStart.y) && isFinite(pointEnd.x) && isFinite(pointEnd.y)) {
        let line = paperArrayAll[this.state.currentFileIndex][channelIdx].path(["M", pointStart.x, pointStart.y, "L", pointEnd.x, pointEnd.y]);
        line.attr("stroke", color);
        line.attr("stroke-width", 3);
        return line;
    } else {
        return undefined;
    }
  }
}