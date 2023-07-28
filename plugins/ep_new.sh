#! /bin/sh

echo "CREATE YOUR NEW ETHERPAD PLUGIN"
echo "-------------------------------"
echo "With this script you can develop different kinds of etherpad plugins:"
echo
echo "A. ep_newplugin you can develop Modules for EtherPad by ether (ep_)"
echo "   Please leave the Identifier option empty when you develop for Etherpad in general"
echo
echo "B. ep_id_newplugin.sh you can develop Modules for i.e. T3Pad (ep_t3_), the Pad for education and communities"
echo "   Please enter your personal identifier."
echo "   It will be added in the form ep_id_ (enter ONLY letters or numbers)"
echo
read -p "ENTER the min. 2 letter IDENTIFIER: " ID

echo
echo "This script is maintained by LisAndi and MontessoriX - All Inclusive Montessori Education for All"
echo "T3Pad is the Etherpad for MontessoriX, Homeschoolers and other Communities - <https://t3pad.com>"
echo "SUPPORT US: <https://ko-fi.com/montessori>"
echo "Etherpad by the Ether Foundation can be reached at <https://etherpad.org>"
echo "LisAndi Co., Ltd. - Software development in Paradies - Rawai, Phuket, Thailand - <https://lisandi.com>"
echo "License: This script is provided under AGPLv.3 <https://www.gnu.org/licenses/agpl-3.0.en.html>"
echo
echo "Let's start!"
echo "-------------------------------------------------------------------------"

# Creating the Name of the plugin
read -p "Enter the plugin name: ep_${ID}_" EPNAME

PLUGINNAME=ep_${ID}_${EPNAME}
echo "-------------------------------------------------------------------------"

# Collecting Data for the description
echo "Your Etherpad plugin ${PLUGINNAME} needs a description of min 50 letters:"
read -p "Enter a short description:" DESCRIPTION
echo "-------------------------------------------------------------------------"

# The Year is needed for the Copyright
date +'%Y'
## Store to a shell variable ##
YEAR=$(date +'%Y')
echo "The Year ${YEAR} is needed for the copyright"
echo "-------------------------------------------------------------------------"

# Collecting Basic PLugin Informations
echo "Your Plugin ${PLUGINNAME} needs some author information"
read -p "Enter your Github UserName: " GITNAME
read -p "Enter your real name: " AUTHORNAME
read -p "Enter your email-address: " AUTHOREMAIL
echo "-------------------------------------------------------------------------"

# Collecting License Information
echo "Under which license you like to release your plugin?"
echo "    1: Apache 2.0 - License of i.e. Etherpad-light - DEFAULT! Press 1"
echo "    2: AGPLv3.0 - License of i.e. T3Pad and Humhub. This script can not be used in Proprietary scripts and derivates have to be published for users"
echo "    3: GPLv2 and later - Used bei many CMS systems i.e. WordPress/Drupal/TYPO3/php-gettext/..."
echo "    4: GPLv3.0 - often used in newer Open Source projects. This script can not be used in Proprietary scripts"
echo "    5: LGPLv2.0 - used by older LGPL scripts like HTML Purifier, PHPMailer, ..."
echo "    6: LGPLv3.0 - i.e. Odoo's, Smarty Template Engine's, License e.a."
echo "    7: MIT - used by most Javascripts and many other smaller scripts"
echo "    8: No License - All rights reserved (This script is incompatible with most Open Source scripts! - please contact the developer before use!)"
while true; do
  read -p "Please enter your License choice (1/2/3/4/5/6/7/8) and then Press ENTER: " LCE
  case ${LCE} in
    [1]* ) echo "The following License has been added to ${PLUGINNAME}: Apache 2.0";break;;
	[2]* ) echo "The following License has been added to ${PLUGINNAME}: AGPLv3.0 - License of i.e. T3Pad and Humhub. This script can not be used in Proprietary scripts and derivates have to be published for users";break;;
    [3]* ) echo "The following License has been added to ${PLUGINNAME}: GPLv2 and later - Used bei many CMS systems i.e. WordPress/Drupal/TYPO3/php-gettext/...";break;;
    [4]* ) echo "The following License has been added to ${PLUGINNAME}: GPLv3.0 - often used in newer Open Source projects. This script can not be used in Proprietary scripts";break;;
    [5]* ) echo "The following License has been added to ${PLUGINNAME}: LGPLv2.0 - used by older LGPL scripts like HTML Purifier, PHPMailer, ...";break;;
    [6]* ) echo "The following License has been added to ${PLUGINNAME}: LGPLv3.0 - i.e. Odoo's, Smarty Template Engine's, License e.a.";break;;
    [7]* ) echo "The following License has been added to ${PLUGINNAME}: MIT - used by most Javascripts and many other smaller scripts";break;;
    [8]* ) echo "No License has been added to ${PLUGINNAME}: All rights reserved (This script is incompatible with most Open Source scripts! - please contact the developer before use!)";break;;
     []* ) echo "Choose the License and then Press ENTER.";exit;;
       * ) echo "Please ENTER the letter of your License choice or press \"1\" for Default Apache 2.0?";;
  esac
done
if [ ${LCE} = "1" ]
then
  LSHORT="Apache-2.0+"
  LICENSEFILE="* @license Apache-2.0+ <http://www.apache.org/licenses/LICENSE-2.0>"
elif [ ${LCE} = "2" ]
then
  LSHORT="AGPL-3+"
  LICENSENAME="GNU Affero General Public License"
  LICENSEVERSION="3 of the License, or (at your option) any later version."
  LICENSEFILE="@license AGPL-3.0+ <https://www.gnu.org/licenses/agpl-3.0.html>"
elif [ ${LCE} = "3" ]
then
  LSHORT="GPL-2+"
  LICENSENAME="GNU General Public License"
  LICENSEVERSION="2 of the License, or (at your option) any later version."
  LICENSEFILE="@license GPL-2.0+ <https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html>"
elif [ ${LCE} = "4" ]
then
  LSHORT="GPL-3+"
  LICENSENAME="GNU General Public License"
  LICENSEVERSION="3 of the License, or (at your option) any later version."
  LICENSEFILE="@license GPL-3.0+ <https://www.gnu.org/licenses/gpl-3.0.en.html>"
elif [ ${LCE} = "5" ]
then
  LSHORT="LGPL-2.1+"
  LICENSENAME="GNU Lesser General Public License"
  LICENSEVERSION="2.1 of the License."
  LICENSEFILE="@license LGPL-2.1 <https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>"
elif [ ${LCE} = "6" ]
then
  LSHORT="LGPL-3+"
  LICENSENAME="GNU Lesser General Public License"
  LICENSEVERSION="3.0 of the License."
  LICENSEFILE="@license LGPL-3.0+ <https://www.gnu.org/licenses/lgpl-3.0.html>"
elif [ ${LCE} = "7" ]
then
  LSHORT="MIT"
  LICENSEFILE="@license MIT <https://opensource.org/licenses/MIT+>"
elif [ ${LCE} = "8" ]
then
  LSHORT="Proprietary - All Rights reserved!"
  LICENSE="/**
 *  ${COPYRIGHT}
 *
 * All Rights reserved! Please contact the developer before
 * any kind of usage, copying or modifying!
 */"
else
   echo "None of the condition met"
fi

COPYRIGHT="/**
  * Copyright ${YEAR} by ${AUTHORNAME} <${AUTHOREMAIL}>
  *
  * This file is part of ${PLUGINNAME}.
  *"
AP1="* Licensed under the Apache License, Version 2.0 or later
  * (the \"License\"); you may not use this file except in
  * compliance with the License.
  * Unless required by applicable law or agreed to in writing,
  * software distributed under the License is distributed on
  * an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
  * either express or implied. See the License for the specific language
  * governing permissions and limitations under the License.
  * You may obtain a copy of the License at
  *
  * ${LICENSEFILE}
  */"
MI1="* Permission is hereby granted, free of charge, to any person
  * obtaining a copy of this software and associated documentation
  * files (the \"Software\"), to deal in the Software without restriction,
  * including without limitation the rights to use, copy, modify, merge,
  * publish, distribute, sublicense, and/or sell copies of the Software,
  * and to permit persons to whom the Software is furnished to do so,
  * subject to the following conditions:
  *"
MI2="* The above copyright notice and this permission notice shall be included
  * in all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,
  * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT."
MI3="* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  * THERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
  * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  *
  * ${LICENSEFILE}
  */"
GP1="* ${PLUGINNAME} is free software: you can redistribute it and/or
  * modify it under the terms of the ${LICENSENAME}
  * as published by the Free Software Foundation, either version 3
  * of the License, or (at your option) any later version.
  *
  * ${PLUGINNAME} is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  * See the ${LICENSENAME} for more details.
  *
  * You should have received a copy of the ${LICENSENAME}
  * along with ${PLUGINNAME}. If not, see <http://www.gnu.org/licenses/>.
  *
  * ${LICENSEFILE}
  */"
if [ ${LCE} = "1" ]
then
  LICENSE="${COPYRIGHT}
  ${AP1}"
elif [ ${LCE} = "2" ]
then
  LICENSE="${COPYRIGHT}
  ${GP1}"
elif [ ${LCE} = "3" ]
then
  LICENSE="${COPYRIGHT}
  ${GP1}"
elif [ ${LCE} = "4" ]
then
  LICENSE="${COPYRIGHT}
  ${GP1}"
elif [ ${LCE} = "5" ]
then
  LICENSE="${COPYRIGHT}
  ${GP1}"
elif [ ${LCE} = "6" ]
then
  LICENSE="${COPYRIGHT}
  ${GP1}"
elif [ ${LCE} = "7" ]
then
  LICENSE="${COPYRIGHT}
  ${MI1}
  ${MI2}"
elif [ ${LCE} = "8" ]
then
LICENSE="${COPYRIGHT}
 * All Rights reserved! Please contact the developer before
 * any kind of usage, copying or modifying!
 */"
else
   echo "None of the condition met"
fi
echo "-------------------------------------------------------------------------"

# Collecting Contributors Informations if they exist
echo -n "Does ${PLUGINNAME} has contributors (y|n)?"
read answer
if [ "$answer" != "${answer#[Yy]}" ] ;then
  echo "Enter contributors CONTRIBUTOR-NAME <CONTRIBUTOR-EMAIl> if any"
  read -p "Enter a contributor's real name: " CONTRIBUTORNAME
  CONTRIBUTORNAMES=${CONTRIBUTORNAME}
  while [ "${CONTRIBUTORNAME}" != "" ]
    do
      read -p "Enter ${CONTRIBUTORNAME}'s email: " CONTRIBUTOREMAIL
      CONTRIBUTORNAMES=${CONTRIBUTORNAMES}" <"${CONTRIBUTOREMAIL}">"
      echo "Adding ${CONTRIBUTORNAMES} as contibutor(s) to ${PLUGINNAME} by ${AUTHORNAME}, <${AUTHOREMAIL}>"
      read -p "Enter another contributor's real name: " CONTRIBUTORNAME
      CONTRIBUTORNAMES=${CONTRIBUTORNAMES}", "${CONTRIBUTORNAME}
  done
  echo "========="
  echo "Name: ${PLUGINNAME}"
  echo "Description: ${DESCRIPTION}"
  echo "Author: ${AUTHORNAME}, <${AUTHOREMAIL}>, <https://github.com/${GITNAME}"
  echo "Contributors: ${CONTRIBUTORS}"
  echo "Version: 0.0.1"
  echo "License:"
  echo "${LICENSE}"
  echo "========="
else
  echo "========="
  echo "Name: ${PLUGINNAME}"
  echo "Description: ${DESCRIPTION}"
  echo "Author: ${AUTHORNAME}, <${AUTHORENAIL}>, <https://github.com/${GITNAME}"
  echo "Version: 0.0.1"
  echo "License:"
  echo "${LICENSE}"
  echo "========="
fi
COMMENTS=$@
echo "-------------------------------------------------------------------------"

# Creating the directory structure
echo "Creating the folderstructure for ${PLUGINNAME} ..."
mkdir ${PLUGINNAME} ${PLUGINNAME}/locales ${PLUGINNAME}/static ${PLUGINNAME}/static/css ${PLUGINNAME}/static/js ${PLUGINNAME}/static/image ${PLUGINNAME}/static/tests ${PLUGINNAME}/templates
echo "---> Folderstructure for ${PLUGINNAME} has been created"
echo "-------------------------------------------------------------------------"

# Creating ${PLUGINNAME}/package.json
echo "Creating the package.json for ${PLUGINNAME} ..."
cat <<EOF >${PLUGINNAME}/package.json
{
  "name": "${PLUGINNAME}",
  "version": "0.0.1",
  "description": "${DESCRIPTION}",
  "author": {
    "name": "${AUTHORNAME}",
    "email":  "<${AUTHOREMAIL}>",
    "github": "https://github.com/${GITNAME}"
  },
  "contributors": [
    "${CONTRIBUTORS}",
  ],
  "keywords": [
    "etherpad",
    "plugin",
    "ep",
  ],
  "license": {
    "${LSHORT}"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/${GITNAME}/${PLUGINNAME}.git",
  },
  "bugs": {
    "url": "https://github.com/${GITNAME}/${PLUGINNAME}/issues",
  },
  "homepage": {
    "url": "https://github.com/${GITNAME}/${PLUGINNAME}/README.md",
  },
  "funding": {
    "type": "individual",
    "url": "https://etherpad.org/",
  },
  "dependencies": {
    "MODULE": "0.3.20",
  },
  "peerDependencies": {
    "ep_etherpad_lite":">=1.8.6",
  },
  "devDependencies": {
    "eslint": "^7.18.0",
    "eslint-config-etherpad": "^1.0.24",
    "eslint-plugin-eslint-comments": "^3.2.0",
    "eslint-plugin-mocha": "^8.0.0",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-prefer-arrow": "^1.2.3",
    "eslint-plugin-promise": "^4.2.1",
    "eslint-plugin-you-dont-need-lodash-underscore": "^6.10.0",
  },
    "eslintConfig": {
    "root": true,
    "extends": "etherpad/plugin",
  },
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
  },
  "engines": {
    "node": ">= 10.13.0",
  }
}
EOF
echo "---> package.json for ${PLUGINNAME} has been created"
echo "-------------------------------------------------------------------------"

# Creating ${PLUGINNAME}/ep.json
echo "Creating the ep.json for ${PLUGINNAME} ..."
cat<<EOF >${PLUGINNAME}/ep.json
{
  "parts": [
    {
      "name": "main",
      "client_hooks": {
        "aceEditEvent": "${PLUGINNAME}/static/js/index",
        "postToolbarInit": "${PLUGINNAME}/static/js/index",
        "aceDomLineProcessLineAttributes": "${PLUGINNAME}/static/js/index",
        "postAceInit": "${PLUGINNAME}/static/js/index",
        "aceInitialized": "${PLUGINNAME}/static/js/index",
        "aceAttribsToClasses": "${PLUGINNAME}/static/js/index",
        "collectContentPre": "${PLUGINNAME}/static/js/shared",
        "aceRegisterBlockElements": "${PLUGINNAME}/static/js/index",
      },
      "hooks": {
        "authorize": "${PLUGINNAME}/YOURFILE:FUNCTIONNAME1",
        "authenticate": "${PLUGINNAME}/YOURFILE:FUNCTIONNAME2",
        "expressCreateServer": "${PLUGINNAME}/YOURFILE:FUNCTIONNAME3",
        "eejsBlock_editbarMenuLeft": "${PLUGINNAME}/index",
        "collectContentPre": "${PLUGINNAME}/static/js/shared",
        "collectContentPost": "${PLUGINNAME}/static/js/shared",
        "padInitToolbar": "${PLUGINNAME}/index",
        "getLineHTMLForExport": "${PLUGINNAME}/index",
      }
    }
  ]
}
EOF
echo "---> ep.json for ${PLUGINNAME} has been created"
echo "-------------------------------------------------------------------------"

# Create ${PLUGINNAME}/README.md
echo "Creating the README.md for ${PLUGINNAME} ..."
cat<<EOF >${PLUGINNAME}/README.md
# ${PLUGINNAME}
![Publish Status](https://github.com/${GITNAME}/${PLUGINNAME}/workflows/Node.js%20Package/badge.svg) ![Publish Status](https://github.com/${GITNAME}/${PLUGINNAME}/workflows/Node.js%20Package/badge.svg)
![Screenshot](https://user-images.githubusercontent.com/220864/107214131-5c3dd600-6a01-11eb-82d9-b2d67ec8ae93.png)
## What is ${PLUGINNAME}?
An Etherpad Plugin to apply the ${PLUGINNAME} functionality in a pad. (describe in minimum 50 Letters what it is)
Currently supports:
* ${PLUGINNAME} functionality 1
* ${PLUGINNAME} functionality 2
* ${PLUGINNAME} functionality 3
* ${PLUGINNAME} functionality 4
## ${PLUGINNAME} Usage
Experimental.  As a special attribute on Etherpad, some weirdness may be experienced by using ${PLUGINNAME}.
## ${PLUGINNAME} History
I decided to copy/paste the ep_t3 over ${PLUGINNAME} to create that plugin.
## ${PLUGINNAME} License
${LICENSE}
## ${PLUGINNAME} Development
I did the development for free to help support continued learning due to disruptions by the coronavirus.
## ${PLUGINNAME} Author
${AUTHORNAME} <${AUTHOREMAIL}>, https://github.com/${GITNAME}
## ${PLUGINNAME} Contributors
${CONTRIBUTORS}
## Help Funding ${PLUGINNAME}
Place your funding information here.
 SEND
 MORE
-----
MONEY
Thanks
${AUTHORNAME}
EOF
echo "---> README.md for ${PLUGINNAME} has been created"
echo "-------------------------------------------------------------------------"

# Create ${PLUGINNAME}/LICENSE.MD
echo "Creating the example English language file en.json for ${PLUGINNAME} ..."
cat<<EOF >${PLUGINNAME}/LICENSE.md
${LICENSE}
EOF
echo "---> LICENSE.md with ${License} for ${PLUGINNAME} has been created"
echo "-------------------------------------------------------------------------"

# CREATE ${PLUGINNAME}/en.json
echo "Creating the example English language file en.json for ${PLUGINNAME} ..."
cat<<EOF >${PLUGINNAME}/locales/en.json
{
  "${PLUGINNAME}.toolbar.left.title" : "Left"
}
EOF
echo "---> The English language file en.json for ${PLUGINNAME} has been created"
echo "-------------------------------------------------------------------------"

# The PLugin has been created
echo
echo "  |==================================================================|"
echo "  | Congratulations!"
echo "  | Your plugin ${PLUGINNAME} "
echo "  | by ${AUTHORNAME} has been created."
echo "  |==================================================================|"
echo

# List all created folders and files.
echo "The following folders and files have been created, you can adjust them further later by editing their content"
find ${PLUGINNAME} -type f,d -printf '%h\0%d\0%p\n' | sort -t '\0' -n | awk -F'\0' '{print $3}'
echo "-------------------------------------------------------------------------"

# move into the plugin folder
cd ${PLUGINNAME}