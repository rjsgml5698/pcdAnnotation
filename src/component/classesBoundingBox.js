import React, { Component } from "react";
import baseBabelTools from "./base_label_tool.js";
import boundingBox from './boundingbox.js';
import imageLabelTools from './image_label_tool';

export default class ClassBoundingBox extends Component {

  constructor(props){
    super(props);
    this.state = {
      classesBoundingBox : {
        "Vehicle": {
            color: '#51C38C',
            index: 0,
            nextTrackId: 1
        },
        "Truck": {
            color: '#EBCF36',
            index: 1,
            nextTrackId: 1
        },
        "Motorcycle": {
            color: '#FF604B',
            index: 2,
            nextTrackId: 1
        },
        "Bicycle": {
            color: '#F37CB2',
            index: 3,
            nextTrackId: 1
    
        },
        "Pedestrian": {
            color: '#74BAF5',
            index: 4,
            nextTrackId: 1
        },
        // nuscenes
        classNameArray: ["human.pedestrian.adult",
            "human.pedestrian.child",
            "human.pedestrian.wheelchair",
            "human.pedestrian.stroller",
            "human.pedestrian.personal_mobility",
            "human.pedestrian.police_officer",
            "human.pedestrian.construction_worker",
            "animal",
            "vehicle.car",
            "vehicle.motorcycle",
            "vehicle.bicycle",
            "vehicle.bus.bendy",
            "vehicle.bus.rigid",
            "vehicle.truck",
            "vehicle.construction",
            "vehicle.emergency.ambulance",
            "vehicle.emergency.police",
            "vehicle.trailer",
            "movable_object.barrier",
            "movable_object.trafficcone",
            "movable_object.pushable_pullable",
            "movable_object.debris",
            "static_object.bicycle_rack"],
        // nuscenes
        colorArray: ['#3ABB9D', '#4DA664', '#2F6CAD', '#4590B6', '#5CADCF', '#3585C5', '#2CA786', '#6ABB72', '#E66B5B', '#A28F85',
            '#F79E3D', '#75706B', '#EE7841', '#D1D5D8', '#CC4846', '#DC5047', '#28324E', '#EFEFEF', '#485675', '#F2D46F', '#533D7F',
            '#9069B5', '#F7C23E'],
        colorIdx: 0,
        content: [],
        __target: "Vehicle",
        currentClass: "Vehicle"
    }
  }}

  addNuSceneLabel = (label) => {
    if (this.content[label] === undefined) {
        this.content[label] = {color: this.colorArray[this.colorIdx], index: this.colorIdx, nextTrackId: 1};
        this.colorIdx++;
    }
  }

  target = () => {
      if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
          return this.content[this.__target];
      } else {
          return this[this.__target];
      }

  }

  select = (label) => {
      this.onChange(label);

      let changeClassOperation = {
          "type": "classLabel",
          "objectIndex": this.props.__selectionIndexCurrentFrame,
          "previousClass": this.props.contents[this.state.currentFileIndex][this.props.__selectionIndexCurrentFrame]["class"],
          "currentClass": label
      };

      if (this.props.getSelectedBoundingBox() !== undefined) {
        this.props.changeClass(this.props.__selectionIndexCurrentFrame, label);
      }

      this.props.operationStack.push(changeClassOperation);


      this.__target = label;
      this.currentClass = label;
  }
  
  onChange = (label) => {
      this.__target = label;
  }

  color = (label) => {
      return this[label].color;
  }

  targetName = () => {
      return this.__target;
  }

  getCurrentClass = () => {
      return this.currentClass;
  }

  render(){
    return(
      <boundingBox
        BoundingBoxClassify={this.state.classesBoundingBox}
      />,
      <baseBabelTools 
        BoundingBoxClassify={this.state.classesBoundingBox}
        addNuSceneLabel={()=>this.addNuSceneLabel}
        target={()=>this.target}
        select={()=>this.select}
        onChange={()=>this.onChange}
        color={()=>this.color}
        targetName={()=>this.targetName}
        getCurrentClass={()=>this.getCurrentClass}
      />,

      <imageLabelTools 
        BoundingBoxClassify={this.state.classesBoundingBox}
      />
    )
  }
}


