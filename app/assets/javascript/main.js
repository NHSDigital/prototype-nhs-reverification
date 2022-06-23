// ES6 or Vanilla JavaScript
// reveal password script

function setUpButton(button, input) {
    var form = document.createElement('form');
    if ('checkValidity' in form && 'querySelector' in document && 'classList' in document.documentElement) {

        // toggle password field between type="text" and type="password"
        var togglePasswordButton = document.querySelector(button);

        if (togglePasswordButton) {
            var togglePasswordButtonText = togglePasswordButton.querySelector('b');
            var passwordField = document.querySelector(input);
            togglePasswordButton.removeAttribute('hidden');


            togglePasswordButton.addEventListener('click', function () {
                var isPressed = JSON.parse(this.getAttribute('aria-pressed'));

                if (isPressed) {
                    passwordField.setAttribute('type', 'password');
                    this.setAttribute('aria-pressed', false);
                    togglePasswordButtonText.textContent = "Show"
                } else {
                    passwordField.setAttribute('type', 'text');
                    this.setAttribute('aria-pressed', true);
                    togglePasswordButtonText.textContent = "Hide"
                }
            });
        }
    }
}

setUpButton('[data-toggle-password]', '[data-toggle-password-field]')
setUpButton('[data-toggle-password-confirm]', '[data-toggle-password-field-confirm]')

//toggle DevMode on and off

function toggleDevMode() {
    const devModeButton = document.querySelector('#nhsuk-footer ul li a[href*="#"]');
    devModeButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (window.location.href.indexOf('devMode=') === -1) {
            window.location.href = window.location.href + '?devMode=1';
        } else {
            window.location.href = '/clear-data';
        }
    }, false);
}
toggleDevMode();



