'use babel';

import AtomicForceView from './atomic-force-view';
import { CompositeDisposable } from 'atom';
const exec = require('child_process').exec;

export default {

  atomicForceView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomicForceView = new AtomicForceView(state.atomicForceViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomicForceView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atomic-force:toggle': () => this.toggle(),
      'force-cli:pushFile': () => this.pushFile(),
      'force-cli:authorizeInstance': () => this.authorizeInstance()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomicForceView.destroy();
  },

  serialize() {
    return {
      atomicForceViewState: this.atomicForceView.serialize()
    };
  },

  authorizeInstance() {
    this.showAuthorizeOptions(function (instanceType) {
      var instanceDomain = (instanceType === 'PROD' ? 'login' : 'test');
      exec('force login -i=' + instanceDomain, (error, stdout, stderr) => {
        if (error) {
          atom.notifications.addError('Problem Logging In: ' + error);
        } else {
          atom.notifications.addInfo('Logged in! ' + stdout);
        }
      });
    });
  },

  showAuthorizeOptions(cbFn) {
    var clickHandler = function (event) {
      var instanceType = event.currentTarget.innerText,
          type = instanceType.toLowerCase().indexOf('production') > -1 ? 'PROD' : 'SANDBOX';
      cbFn(type);
    };

    atom.workspace.addModalPanel({
      item: this.atomicForceView.makeButtonPanel([{name: 'production/developer', cbFn: clickHandler},
                                                  {name: 'sandbox', cbFn: clickHandler}]),
      visible: true
    });

  },

  getProjectDir(currentPath) {
    // hacky!
    return currentPath.split('src')[0];
  },

  pushFile() {
    var editor = atom.workspace.getActivePaneItem(),
        filePath = editor.getPath(),
        fileExt = filePath.split('.').pop(),
        projectDir = this.getProjectDir(filePath),
        auraExts = ['cmp', 'js'],
        apexExts = ['page', 'cls'];

    var command = 'cd ' + projectDir + '; ' + 'force ';
    if (auraExts.indexOf(fileExt) > -1) {
      command = command + ' aura push -f ' + filePath;
    } else if (apexExts.indexOf(fileExt) > -1) {
      command = command + 'push -t ApexClass ' + filePath;
    } else {
      command = command + 'push -t ApexClass ' + filePath;
    }

    atom.notifications.addInfo('Pushing File');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        atom.notifications.addError('Problem Pushing File: \n' + error);
      } else {
        atom.notifications.addInfo(stdout);
      }
    });
  },

  toggle() {
    console.log('AtomicForce was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
