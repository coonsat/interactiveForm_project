

//when document loaded, set name be in focus
document.addEventListener("DOMContentLoaded", function() {

    const getDomElement = value => {
        return document.querySelector(value);
    };

    const setValidity = (valid, element) => {
        element.className = valid ? "valid" : "not-valid";
    }

    const setVisibility = (valid, element) => {
        if (!valid) {
            element.className = "";
            element.display = "inline";
        } else {
            element.className = "hint";
            element.display = "none";
        }
    }

    const setFieldSetValidity = (valid, element) => {
        element.className = valid ? "activities valid" : "activities not-valid";
    }

    const validateForm = {

        name : function(name) {
            if ( name.length === 0 ) return false;
            return true;
        },

        email : function(email) {
            if ( !email.includes('@') ) return false;
            if ( !email.includes('.com') ) return false;
            if ( (email.substr(0, email.indexOf('@') - 1).length) === 0 ) return false;
            if ( (email.substr(email.indexOf('@') + 1, email.indexOf('.com') - 1).length) === 0 ) return false;
            return true;
        },

        cost : function(cost) {
            if ( cost === 0 ) return false;
            return true;
        },

        card : function(cardDetail, value) {
            switch(cardDetail) {
                case "cardNumber":
                    if ( value.length <= 13 && value.length >= 16 ) return false;
                    return true;

                case "zip":
                    if ( value.length !== 5 ) return false;
                    return true;

                case "ccv":
                    if ( value.length !== 3) return false;
                    return true;

                default:
                    return false;
            }
        }

    };

    const nameInput = getDomElement('#name');
    nameInput.focus();

    const otherJobInput = getDomElement('.other-job-role');
    otherJobInput.style.display = "none";

    const jobRoles = getDomElement('#title');
    jobRoles.addEventListener('change', function() {
        if (this.value === "other") {
            otherJobInput.style.display = "inline";
        } else {
            otherJobInput.style.display = "none";
        }
    });

    //5.
    //Set up color to display drop down elements
    //that correspond to the design chosen
    //This is my own code however the following resource was used and adapted:
    //https://dev.to/isabelxklee/how-to-loop-through-an-htmlcollection-379k
    const colour = getDomElement('#color');
    colour.disabled = true;
    const design = getDomElement('#design');
    design.addEventListener('change', function() {
        if (this.value) {
            colour.disabled = false;
            Array.from(colour.options).forEach((option) => {
                if (option.dataset.theme !== this.value) {
                    option.style.display = "none"
                } else {
                    option.style.display = "inline";
                }
            });
        } else {
            colour.disabled = true;
        }
    });

    //6.
    //Set up total to change according to
    //check boxes ticked
    //This is my own code however the following resource was used and adapted:
    //https://dev.to/isabelxklee/how-to-loop-through-an-htmlcollection-379k
    const activities = getDomElement('#activities');
    let cost = 0;
    activities.addEventListener('change', function(event) {
        let costDisplay = getDomElement('#activities-cost');
        costDisplay.textContent = "";
        cost = 0;
        const children = this.children.item(1).children;
        Array.from(children).forEach(activity => {
            if (activity.children[0].checked) {
                cost += parseInt(activity.children[0].dataset.cost);
            }
        })
        costDisplay.textContent = "Total: $" + cost;
    });

    //9. Accessibility for input elements
    //add two event listeners to the parent class of the selected
    //input item. The classes will be overwritten each time. 
    const children = activities.children.item(1).children;
    Array.from(children).forEach(label => {
        inputElement = label.children[0];
        inputElement.addEventListener('focus', function(event) {
            label.className = "focus";
        });

        inputElement.addEventListener('blur', function(event) {
            label.className = "blur";
        });
    });

    //7.
    //Set up credit card payment section
    //First set the default to credit-card
    //Then add an event listener to the payment select tag
    const payment = getDomElement('#payment');
    Array.from(payment.options).forEach(option => {
        if (option.value === "credit-card") {
            option.selected = true;
        } else {
            let element = getDomElement('#' + option.value);
            if (element) element.style.visibility = "hidden";
        }
    });
    //Iterate through payment options to find which
    //is the selected option. 
    //If the option.value matches the selected value then set the view to visible.
    //If not then hide the view
    payment.addEventListener('change', function() {
        Array.from(payment.options).forEach(option => {
            if (option.value === this.value) {
                let selected = getDomElement('#' + this.value);
                selected.style.visibility = "visible";
            } else {
                let nonSelected = getDomElement('#' + option.value);
                if (nonSelected) nonSelected.style.visibility = "hidden";
            }
        });
    });

    //8.
    //Validation of data after submit button pressed
    const submitButton = document.getElementsByTagName('button')[0];
    submitButton.addEventListener('click', function(event) {
        
        let valid = true;
        
        //Name
        const name = getDomElement('#name');
        const nameLabel = name.parentElement;
        if ( !validateForm.name(name.value) ) {
            setValidity(false, name.parentElement);
            setVisibility(false, nameLabel.lastElementChild);
            valid = false;
        } else {
            setValidity(true, name.parentElement);
            setVisibility(true, nameLabel.lastElementChild);
        }

        //Email
        const email = getDomElement('#email');
        const emailLabel = email.parentElement;
        if ( !validateForm.email(email.value) ) {
            setValidity(false, email.parentElement);
            setVisibility(false, emailLabel.lastElementChild);
            valid = false;
        } else {
            setValidity(true, email.parentElement);
            setVisibility(true, emailLabel.lastElementChild);
        }

        //Check if activities have been chosen
        const costFieldSet = getDomElement('#activities');
        const costElement = getDomElement('#activities-cost');
        const costString = costElement.textContent;
        const totalCost = costString.substring( costString.indexOf('$') + 1 );
        if ( !validateForm.cost( parseInt(totalCost) ) ) {
            setValidity(false, costFieldSet);
            valid = false;
        } else {
            setValidity(true, costFieldSet);
        }

        //Check details of card number used for payment
        const cardNumber = getDomElement('#' + 'cc-num');
        console.log(cardNumber);
        if ( !validateForm.card('cardNumber', cardNumber.value)) {
            setFieldSetValidity(false, costFieldSet);
            valid = false;
        } else {
            setFieldSetValidity(true, costFieldSet);
        }

        //Check details of zip used for payment
        const zip = getDomElement('#' + 'zip');
        if ( !validateForm.card('zip', zip.value) ) {
            setFieldSetValidity(false, costFieldSet);
            valid = false;
        } else {
            setFieldSetValidity(true, costFieldSet);
        }

        //Check details of ccv used for payment
        const ccv = getDomElement('#' + 'cvv');
        if ( !validateForm.card('ccv', ccv.value) ) {
            setFieldSetValidity(false, costFieldSet);
            valid = false;
        } else {
            setFieldSetValidity(true, costFieldSet);
        }

        console.log(valid)
        if ( !valid ) event.preventDefault();
    });

})
