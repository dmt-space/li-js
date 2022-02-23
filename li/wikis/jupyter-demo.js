export const demo = {
    "label": "li_jupiter_demo",
    "cells": [
        {
            "order": 0,
            "cell_type": "html-cde",
            "cell_extType": "html-cde",
            "source": "<p><span style=\"color:#2980b9\"><span style=\"font-size:22px\"><strong>You have reached the home </strong></span><span style=\"font-size:36px\"><strong>wikis</strong></span><span style=\"font-size:22px\"><strong> web page.</strong></span></span><strong><span style=\"font-size:22px\"><span style=\"color:#2980b9\">.</span></span></strong></p>\n\n<p><span style=\"font-size:18px\"><strong>It&#39;s absolutely free.</strong> </span></p>\n\n<p><span style=\"font-size:16px\">You can create articles, code examples, executable code, copy information from web pages and paste it into your documents using jupiter notebook :</span></p>\n\n<p><span style=\"font-size:16px\"><a href=\"https://resu062.github.io/li-js/li/jupyter/index.html\">https://resu062.github.io/li-js/li/jupyter/index.html</a></span></p>\n\n<p><span style=\"font-size:16px\">Try adding a new article in the tree on the left side wiki-articles and create a cell with the required content using the blue plus sign on the main screen.</span></p>\n\n<p><span style=\"font-size:16px\">Your data is stored in the local storage of the device on which the wikis is running. You can use a remotely installed CouchDB&nbsp;database and having access to it (for example, via vpn) with synchronization enabled, you will get access to your data from any device.</span></p>\n\n<p><strong><span style=\"font-size:18px\">Try it. You should like it.</span></strong></p>\n\n<p><span style=\"font-size:16px\">You are now reading data in a cell in a li-jupiter-notebook. Below is some demo data of possible cells. Try to copy some information from a page on the Internet and paste it into the ntml pellet editor...</span></p>\n\n<p><span style=\"font-size:16px\">Try adding or removing cells, changing data in them.</span></p>\n\n<p><span style=\"font-size:12px\">This page will stop showing after entering your data&nbsp;&nbsp;in the tree on the left side.</span></p>\n",
            "label": "html-CDEditor"
        },
        {
            "cell_type": "markdown",
            "source": "## li-jupyter-notebook demo :\n",
            "order": 1
        },
        {
            "cell_type": "html",
            "source": "<b><font face=\"Comic Sans MS, cursive\" color=\"#0091ff\">I'm an HTML viewer with a Pell editor...</font></b>",
            "color": "#16C60C",
            "order": 2
        },
        {
            "cell_type": "html-cde",
            "source": "<p><strong><strong><span style=\"color:#006600; font-family:Comic Sans MS,cursive\">I&#39;m an HTML viewer with a CDEditor ...</span></strong></strong></p>\n",
            "color": "#16C60C",
            "order": 3
        },
        {
            "order": 4,
            "cell_type": "html",
            "cell_extType": "html",
            "source": "<font color=\"#f00505\"><b>Auto executable code in document :</b></font>",
            "label": "html-pell-editor"
        },
        {
            "cell_type": "html-executable",
            "cell_extType": "html-executable",
            "sourceHTML": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js\"></script>\n\n<h1>Wireframe Cube (WebGL - ThreeJS)</h1>\n\n\n<!-- this is resizable cell -->\n\n",
            "sourceJS": "var width, height, scene, camera, renderer, cube, xRot, yRot, zRot, triangles;\n\nfunction init() {\n  xRot = yRot = zRot = 0.001;\n  triangles = 20;\n  width = window.innerWidth;\n  height = window.innerHeight;\n  scene = new THREE.Scene();\n  camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);\n  camera.position.z = 1000;\n  renderer = new THREE.WebGLRenderer();\n  renderer.setSize(width, height);\n  document.body.appendChild(renderer.domElement);\n};\n\nfunction createCube() {\n  cube = new THREE.Mesh(new THREE.BoxGeometry(700, 700, 700, triangles,triangles,triangles), new THREE.MeshBasicMaterial({\n    color: 0x0099ff,\n    wireframe: true\n  }));\n  scene.add(cube);\n};\n\nfunction update() {\n  requestAnimationFrame(update);\n  cube.rotation.x += xRot;\n  cube.rotation.y += yRot;\n  cube.rotation.z += zRot;\n  renderer.render(scene, camera);\n}\n\ninit();\ncreateCube();\nupdate();\n",
            "sourceCSS": "body {\n  padding: 0px;\n  margin: 0px;\n  background-color: #000;\n}\n\nh1 {\n  position: absolute;\n  top: 1%;\n  left: 1%;\n  font-family: \"Century Gothic\";\n  color: orange;\n  font-weight: 100;\n  font-variant: small-caps;\n}\n",
            "cell_h": 400,
            "order": 5
        },
        {
            "order": 6,
            "cell_type": "html",
            "cell_extType": "html",
            "source": "<div><b><font color=\"#f50505\">Sample code cells :</font></b></div>",
            "label": "html-pell-editor"
        },
        {
            "cell_type": "code",
            "source": "var str = \"hello world\"\nstr.split('').forEach(c => {\n    console.log(c)\n})",
            "order": 7
        },
        {
            "cell_type": "markdown",
            "source": "## Sample markdown document\r\n\r\n ![](https://resu062.github.io/li-js/lib/li.png =150x150)\r\n\r\n### Code javascript:\r\n\r\n```javascript \r\nfunction createCube() {\r\n  cube = new THREE.Mesh(new THREE.BoxGeometry(700, 700, 700, triangles,triangles,triangles), new THREE.MeshBasicMaterial({\r\n    color: 0x0099ff,\r\n    wireframe: true\r\n  }));\r\n  scene.add(cube);\r\n};\r\n```\r\n# This is level 1 (article title)\r\n## This is level 2\r\n### This is level 3\r\n#### This is level 4\r\n##### This is level 5\r\n\r\nThis text is **bold**.\r\nThis text is *italic*.\r\nThis text is both ***bold and italic***.\r\n   \r\nThis is not \\*italicized\\* type.\r\n\r\n1. This is step 1.\r\n1. This is the next step.\r\n1. This is yet another step, the third.\r\n\r\n* First item in an unordered list.\r\n* Another item.\r\n* Here we go again.\r\n\r\nMake sure that your table looks like this: \r\n\r\n\r\n| Header | Another header | Yet another header |\r\n|--- |--- |--- |\r\n| row 1 | column 2 | column 3 |\r\n| row 2 | row 2 column 2 | row 2 column 3 |\r\n\r\n\r\nor ...\r\n\r\n\r\n***",
            "order": 8
        }
    ]
}
