import React, { Component } from "react";
import labelTool from "./base_label_tool";
import image_label_tool from "./image_label_tool";

export default class AjaxWrapper extends Component {

  constructor(props){
    super(props);
    this.state ={
      projects : [],
      info : [],
      showPopup: false,
      type: 'Supervisor',
      name: ''
    };
    this.firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).getTime()
    this.firstDayOfNextYear = new Date(new Date().getFullYear() + 1, 0, 1).getTime()
  }

  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  request(options) {
    if (options.type === "GET") {
        let res;
        switch (options.url) {
            case "/label/annotations/":
                let fileName = options.data["file_name"];
                res = [];
                res = this.parseAnnotationFile(fileName);
                options.success(res);
                break;
        }
    }
}

  annotationFileExist(fileIndex, channel) {
    let url;
    if (this.state.showOriginalNuScenesLabels === true) {
        url = 'input/' + this.state.currentDataset + '/Annotations/' + channel + '/' + this.state.fileNames[fileIndex] + '.txt';

    } else {
        url = 'input/' + this.state.currentDataset + '/' + this.state.currentSequence + '/annotations/' + this.state.currentDataset + "_" + this.state.currentSequence + '_annotations.txt';

    }


    let http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status !== 404;
}

  parseAnnotationFile(fileName) {
    let rawFile = new XMLHttpRequest();
    let annotationsJSONArray = [];
    let frameAnnotations = [];
    try {
        if (this.state.currentDataset === this.state.datasets.NuScenes) {
            if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
                rawFile.open("GET", 'input/' + this.state.currentDataset + '/annotations_original/LIDAR_TOP/' + fileName, false);
            } else {
                rawFile.open("GET", 'input/' + this.state.currentDataset +'/'+this.state.currentSequence+ '/annotations/LIDAR_TOP/' + fileName, false);
            }
        } else {
            rawFile.open("GET", 'input/' + this.state.currentDataset + '/' + this.state.currentSequence + '/annotations/' + fileName, false);
        }


    } catch (error) {
        // no labels available for this camera image
        // do not through an error message
    }

    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                if (this.state.currentDataset === this.state.datasets.NuScenes && this.state.showOriginalNuScenesLabels===true) {
                    let str_list = rawFile.responseText.split("\n");
                    for (let i = 0; i < str_list.length; i++) {
                        let str = str_list[i].split(" ");
                        if (str.length === 16) {
                            frameAnnotations.push({
                                class: str[0],
                                truncated: str[1],
                                occluded: str[2],
                                alpha: str[3],
                                left: str[4],
                                top: str[5],
                                right: str[6],
                                bottom: str[7],
                                height: str[8],
                                width: str[9],
                                length: str[10],
                                x: str[11],
                                y: str[12],
                                z: str[13],
                                rotationY: str[14],
                                score: str[15]
                            });
                        } else if (str.length === 18) {
                            frameAnnotations.push({
                                class: str[0],
                                truncated: str[1],
                                occluded: str[2],
                                alpha: str[3],
                                left: str[4],
                                top: str[5],
                                right: str[6],
                                bottom: str[7],
                                height: str[8],
                                width: str[9],
                                length: str[10],
                                x: str[11],
                                y: str[12],
                                z: str[13],
                                rotationY: str[14],
                                score: str[15],
                                trackId: str[16],
                                fileIndex: str[17]
                            });
                        }
                    }
                    return frameAnnotations;
                } else {
                    let annotationsJSONString = rawFile.responseText;
                    annotationsJSONArray = eval(annotationsJSONString);
                    return annotationsJSONArray;
                }
            } else {
                return null;
            }
        }
    };

    rawFile.send(null);
    if (this.state.showOriginalNuScenesLabels===true) {
        return frameAnnotations;
    } else {
        return annotationsJSONArray;
    }
  }
}
