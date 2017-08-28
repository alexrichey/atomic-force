'use babel';
$ = jQuery = require('jquery');

export default class AtomicForceView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atomic-force');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The AtomicForce package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  makeButtonPanel(buttons) {
    var newDiv = $(document.createElement('div'));
    newDiv.addClass('atomic-force-buttons');
    newDiv.append($.parseHTML('<div>What type of Org?</div>'));

    var button, id;
    $.each(buttons, function (i, button) {
      id = 'force-authorize-options-' + button.name;
      // button = $.parseHTML("<div class='block force-authorize-options'> <button class='btn btn-lg'>" +
      //          buttons[i].name + "</button> </div>");
      button = $('<button>', {class: 'btn btn-lg', html: buttons[i].name});
      button.on("click", function (evt) {
        buttons[i].cbFn(evt);
      });
      newDiv.append(button);
    });

    return newDiv;
  }
  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
