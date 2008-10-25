# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Mozilla Corporation Code.
#
# The Initial Developer of the Original Code is
# Mikeal Rogers.
# Portions created by the Initial Developer are Copyright (C) 2008
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#  Mikeal Rogers <mikeal.rogers@gmail.com>
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

import os
import sys
import urllib

import jsbridge
from jsbridge import global_settings

basedir = os.path.abspath(os.path.dirname(__file__))

global_settings.MOZILLA_PLUGINS.append(os.path.join(basedir, 'extension'))

passes = []
fails = []

pass_listener = lambda obj: passes.append(obj)
fail_listener = lambda obj: fails.append(obj)

def endRunner_listener(obj):
    print 'Passed '+str(len(passes))+' :: Failed '+str(len(fails))        

def main():
    parser = jsbridge.parser
    parser.remove_option('-l')
    parser.set_default('launch', True)
    parser.add_option("-t", "--test", 
                      dest="test", default=False,
                      help="Run test file or directory.")
    
    (options, args) = parser.parse_args()
    if options.test:
        moz = jsbridge.cli(shell=False, options=options, block=False)
        
        from jsbridge import network, events
        from jsbridge.jsobjects import JSObject
        
        events.add_listener(pass_listener, event='mozmill.pass')
        events.add_listener(fail_listener, event='mozmill.fail') 
        events.add_listener(endRunner_listener, event='mozmill.endRunner')
        
        frame = JSObject(network.bridge, "Components.utils.import('resource://mozmill/modules/frame.js')")
        frame.runTestFile(options.test)
        moz.stop()
    else:    
        jsbridge.cli(shell=False, options=options)


