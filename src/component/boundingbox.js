import React, { Component } from "react";
import baseBabelTools from './base_label_tool.js';
import imageLabelTools from './image_label_tool.js';
import pcdLabelTool from './pcd_label_tool.js';
import classBoundingBox from './classesBoundingBox.js';
import $ from 'jquery';
window.$ = $;

console.log("baseBabelTools", baseBabelTools)
export default class BoundingBox extends Component {

constructor(props){
  super(props);
  this.state ={
    contents: [],
    contentsDetections: [],
    __selectionIndexCurrentFrame: null,
    __selectionIndexNextFrame : null,
    __insertIndex: null,
  };
  }

  // localOnSelect = () => {
  //   "CAM_FRONT_LEFT": function (index) {
  //   },
  //   "CAM_FRONT": function (index) {
  //   },
  //   "CAM_FRONT_RIGHT": function (index) {
  //   },
  //   "CAM_BACK_RIGHT": function (index) {
  //   },
  //   "CAM_BACK": function (index) {
  //   },
  //   "CAM_BACK_LEFT": function (index) {
  //   },
  //   "PCD": function (index) {
  //   }
  // }

  // localOnChangeClass = () => {
  //   "CAM_FRONT_LEFT": function (index, label) {
  //   },
  //   "CAM_FRONT": function (index, label) {
  //   },
  //   "CAM_FRONT_RIGHT": function (index, label) {
  //   },
  //   "CAM_BACK_RIGHT": function (index, label) {
  //   },
  //   "CAM_BACK": function (index, label) {
  //   },
  //   "CAM_BACK_LEFT": function (index, label) {
  //   },
  //   "PCD": function (index, label) {
  //   }
  // }

  onSelect = (dataType, f) => {
    this.localOnSelect[dataType] = f;
  }

  onChangeClass(dataType, f){
      this.localOnChangeClass[dataType] = f;
  }

  onRemove(dataType){

  }

  get(index, channel){
    const contents = this.state.contents;

    if (contents[index] === undefined) {
        return undefined;
    }
    if (channel === undefined) {
        return contents[index];
    }
    return contents[index][channel];
  }

  set(insertIndex, params){

    const contents = this.state.contents;

    // get3DLabel는  pcd_label.js.에 잇음
    // let obj = get3DLabel(params);
    let obj = this.props.get3DLabel(params);
    if (contents[params.fileIndex][insertIndex] === undefined) {
      contents[params.fileIndex].push(obj);
    } else {
      contents[params.fileIndex][insertIndex] = obj;
    }
    contents[params.fileIndex][insertIndex]["class"] = params.class;
    contents[params.fileIndex][insertIndex]["interpolationStart"] = params["interpolationStart"];
    contents[params.fileIndex][insertIndex]["interpolationStartFileIndex"] = params.interpolationStartFileIndex;
    contents[params.fileIndex].insertIndex = insertIndex;
    if (params.fromFile === false && this.state.__selectionIndexCurrentFrame === -1) {
        if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
          contents[params.fileIndex][insertIndex]["trackId"] = this.props.BoundingBoxClassify.content[params.class].nextTrackId;
        } else {
          contents[params.fileIndex][insertIndex]["trackId"] = this.props.BoundingBoxClassify[params.class].nextTrackId;
        }
    } else {
      contents[params.fileIndex][insertIndex]["trackId"] = params.trackId;
    }
    contents[params.fileIndex][insertIndex]["channels"] = params.channels;
    contents[params.fileIndex][insertIndex]["fileIndex"] = params.fileIndex;
    contents[params.fileIndex][insertIndex]["copyLabelToNextFrame"] = params.copyLabelToNextFrame;
  }

  changeClass(selectedObjectIndex, newClassLabel){
    const contents = this.state.contents;
    if (contents[this.state.currentFileIndex][selectedObjectIndex] === undefined) {
        return false;
    }

    // return if same class was chosen again
    let currentClassLabel = this.props.getCurrentClass();
    if (currentClassLabel === newClassLabel) {
        return false;
    }


    // update id of sprite
    let currentTrackId = contents[this.state.currentFileIndex][selectedObjectIndex]["trackId"];
    let spriteElem = $("#class-" + contents[this.state.currentFileIndex][selectedObjectIndex]["class"].charAt(0) + currentTrackId);
    // use original track id if original class selected
    let nextTrackIdNewClass;
    if (newClassLabel === contents[this.state.currentFileIndex][selectedObjectIndex]["original"]["class"]) {
        nextTrackIdNewClass = contents[this.state.currentFileIndex][selectedObjectIndex]["original"]["trackId"]
    } else {
        nextTrackIdNewClass = this.props.BoundingBoxClassify[newClassLabel]["nextTrackId"];
    }

    $(spriteElem).attr("id", "class-" + newClassLabel.charAt(0) + nextTrackIdNewClass).attr("background", "rgba(255, 255, 255, 0.8)");

    // update background color of sprite
    $($(spriteElem)[0]).css("background", this.props.BoundingBoxClassify[newClassLabel].color);

    // update class label
    contents[this.state.currentFileIndex][selectedObjectIndex]["class"] = newClassLabel;

    // update track id
    contents[this.state.currentFileIndex][selectedObjectIndex]["trackId"] = nextTrackIdNewClass;
    // decrease track id of current (previous) class
    this.props.BoundingBoxClassify[currentClassLabel]["nextTrackId"] = this.props.BoundingBoxClassify[currentClassLabel]["nextTrackId"] - 1;
    // increase track id of new class
    this.props.BoundingBoxClassify[newClassLabel]["nextTrackId"] = this.props.BoundingBoxClassify[newClassLabel]["nextTrackId"] + 1;

    // update text of sprite
    $($(spriteElem)[0]).text(newClassLabel.charAt(0) + nextTrackIdNewClass + " | " + newClassLabel);
    // update name of sprite
    this.props.spriteArray[this.state.currentFileIndex][selectedObjectIndex].name = "sprite-" + newClassLabel.charAt(0) + nextTrackIdNewClass;

    // update class of folder and track id instead of creating new folder
    this.props.folderBoundingBox3DArray[selectedObjectIndex].domElement.children[0].children[0].innerHTML = newClassLabel + ' ' + nextTrackIdNewClass;
    //                                                           ul        number      div       div[class c]    input
    this.props.folderBoundingBox3DArray[selectedObjectIndex].domElement.children[0].children[3].children[0].children[1].children[0].value = nextTrackIdNewClass;

    // open current folder
    this.props.folderBoundingBox3DArray[selectedObjectIndex].open();
    this.props.folderPositionArray[selectedObjectIndex].open();
    this.props.folderSizeArray[selectedObjectIndex].open();
    // update name of selected object
    this.props.selectedMesh.name = "cube-" + newClassLabel.charAt(0) + nextTrackIdNewClass;
    for (let channelObj in this.props.camChannels) {
        if (this.props.camChannels.hasOwnProperty(channelObj)) {
            let channelObject = this.props.camChannels[channelObj];
            this.localOnChangeClass[channelObject.channel](selectedObjectIndex, newClassLabel);
        }
    }
    this.localOnChangeClass["PCD"](selectedObjectIndex, newClassLabel);
    let classPickerElem = $('#class-picker ul li');
    classPickerElem.css('background-color', '#353535');
    $(classPickerElem[this.props.BoundingBoxClassify[newClassLabel].index]).css('background-color', '#525252');
  }

  getSelectedBoundingBox(){
    const contents = this.state.contents;

      if (this.state.__selectionIndexCurrentFrame === -1 || contents[this.state.currentFileIndex][this.__selectionIndexCurrentFrame] === undefined) {
          return undefined;
      } else {
          return contents[this.state.currentFileIndex][this.state.__selectionIndexCurrentFrame];
      }
  }

  setSelectionIndex(selectionIndex, channel){
      // show bounding box highlighting
      const __selectionIndexCurrentFrame = this.state.__selectionIndexCurrentFrame;

      __selectionIndexCurrentFrame = selectionIndex;
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
      return this.state.__selectionIndexCurrentFrame;
  }

  selectEmpty(){
      this.setSelectionIndex(-1, undefined);
  }

  remove(index){

      const __insertIndex = this.state.__insertIndex;
      const contents = this.state.contents;

      // remove 3d object
      this.props.removeObject("cube-" + contents[this.state.currentFileIndex][index]["class"].charAt(0) + this.contents[this.state.currentFileIndex][index]["trackId"]);
      // remove 2d object
      this.remove(index);
      delete contents[this.state.currentFileIndex][index];
      contents[this.state.currentFileIndex].splice(index, 1);
      delete this.props.cubeArray[this.state.currentFileIndex][index];
      this.props.cubeArray[this.state.currentFileIndex].splice(index, 1);
      __insertIndex--;
      this.select(-1, undefined);
  }

  removeSelectedBoundingBox(){
      this.remove(this.state.__selectionIndexCurrentFrame);
  }

  clear(){

    const __insertIndex = this.state.__insertIndex;
    const __selectionIndexNextFrame = this.state.__selectionIndexNextFrame;
    const contents = this.state.contents;

      for (let j = 0; j <contents.length; j++) {
          for (let i = 0; i < contents[j].length; i++) {
              this.props.removeObject("cube-" + contents[j][i]["class"].charAt(0) + contents[j][i]["trackId"]);
          }
      }

      this.setState({
        __selectionIndexCurrentFrame: -1
      })

      // this.__selectionIndexCurrentFrame = -1;
      __selectionIndexNextFrame = -1;
      __insertIndex = 0;
      contents[this.state.currentFileIndex] = [];
  }

  // __selectionIndexCurrentFrame: -1,
  // __selectionIndexNextFrame: -1,
  // __insertIndex: 0

  drawLine(channelIdx, pointStart, pointEnd, color){
    if (pointStart !== undefined && pointEnd !== undefined && isFinite(pointStart.x) && isFinite(pointStart.y) && isFinite(pointEnd.x) && isFinite(pointEnd.y)) {
        let line = this.props.paperArrayAll[this.state.currentFileIndex][channelIdx].path(["M", pointStart.x, pointStart.y, "L", pointEnd.x, pointEnd.y]);
        line.attr("stroke", color);
        line.attr("stroke-width", 3);
        return line;
    } else {
        return undefined;
    }
  }

  render(){
    return(

      <pcdLabelTool 
        contents={this.state.contents}
        getSelectionIndex={()=>this.getSelectionIndex}
        onSelect={()=>this.onSelect}
        onChangeClass={()=>this.onChangeClass}
        contents={this.state.contents}
      />,

      <classBoundingBox 
        __selectionIndexCurrentFrame={this.state.__selectionIndexCurrentFrame}
        contents={this.state.contents}
        getSelectedBoundingBox={()=>this.getSelectedBoundingBox}
        changeClass={()=>this.changeClass}
      />,

      <baseBabelTools 
        contents={this.state.contents}
        contentsDetections={this.state.contentsDetections}
        // localOnSelect={()=>this.localOnSelect}
        // localOnChangeClass={()=>this.localOnChangeClass}
        onSelect={()=>this.onSelect}
        onChangeClass={()=>this.onChangeClass}
        onRemove={()=>this.onRemove}
        get={()=>this.get}
        set={()=>this.set}
        changeClass={()=>this.changeClass}
        getSelectedBoundingBox={()=>this.getSelectedBoundingBox}
        setSelectionIndex={()=>this.setSelectionIndex}
        select={()=>this.select}
        getSelectionIndex={()=>this.getSelectionIndex}
        selectEmpty={()=>this.selectEmpty}
        // renderer는 three.js의 renderer로 넘어가야함
        renderer={this.state.renderer}
        remove={()=>this.remove}
        removeSelectedBoundingBox={()=>this.removeSelectedBoundingBox}
        clear={()=>this.clear}
        drawLine={()=>this.drawLine}
        __selectionIndexCurrentFrame={this.state.__selectionIndexCurrentFrame}
      />,

      <imageLabelTools 
        contents={this.state.contents}
        remove={()=>this.remove}
        selectEmpty={()=>this.selectEmpty}
        getSelectionIndex={()=>this.getSelectionIndex}

      />
    )
  }
}