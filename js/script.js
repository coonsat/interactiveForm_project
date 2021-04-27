

//when document loaded, set name be in focus
document.addEventListener("DOMContentLoaded", function() {

    const getDomElement = value => {
        return document.querySelector(value);
    };

    const setValidity = (valid, element) => {
        element.className = valid ? "valid" : "not-valid";
    };

    const setVisibility = (visible, element) => {
        if (visible) {
            element.visibility = "visible";
        } else {
            element.visibility = "hidden";
        }
    };

    const setFieldSetValidity = (valid, mainClass, element) => {
        element.className = valid ? mainClass + " valid" : mainClass + " not-valid";
    };

    const getParentElement = element => {
        return element.parentElement;
    }

    //Fetch all relevant information from a label tag and
    //return an object.
    const getCourseInfo = (courseName, timeFrame) => {
        let courseInfo = new Object();
        courseInfo.name = courseName;

        if (timeFrame !== null) {
            const day = timeFrame.substring( 0, timeFrame.indexOf(' ') );
            const start = timeFrame.substring( timeFrame.indexOf(' ') + 1, timeFrame.indexOf('-') );
            const end = timeFrame.substring( timeFrame.indexOf('-') + 1, timeFrame.length );

            //For day
            courseInfo.day = day;

            //For start time (convert to 24 hour time)
            if ( start.includes('pm') ) {
                courseInfo.start = parseInt(start.substring(0, start.length - 1)) + 12;
            } else {
                courseInfo.start = parseInt(start.substring(0, start.length - 1));
            }
    
            //For end time (convert to 24 hour time)
            if ( end.includes('pm') && !end.includes('12') ) {
                courseInfo.end = parseInt(end.substring(0, end.length - 1)) + 12;
            } else {
                courseInfo.end = parseInt(end.substring(0, end.length - 1));
            }

            return courseInfo;
        } else {
            return null;
        }
    };

    //Evaluate whether there is overlap between the schedules
    const checkForOverlap = (selectedActivity, comparisonActivity) => {
        //case 1: if start doesn't exist then there is no overlap
        if ( !selectedActivity.start ) return false;

        //case 2: if the days aren't the same then no overlap exists
        if ( selectedActivity.day !== comparisonActivity.day ) return false;

        //case 3: if unselected start GTE selected start AND unselected end LTE selected end
        if ( (comparisonActivity.start >= selectedActivity.start) && (comparisonActivity.end <= selectedActivity.end) ) return true;

        //case 4: if unselected start LTE selected start AND unselected end GTE selected start
        if ( (comparisonActivity.start <= selectedActivity.start) && (comparisonActivity.end >= selectedActivity.start) ) return true;

        //case 5: if unselected start GTE selected start AND unselected start LTE selected end
        if ( (comparisonActivity.start >= selectedActivity.start) && (comparisonActivity.start <= selectedActivity.end) ) return true;
        
        //case 6: if unselected start LTE selected start AND unselected end GTE selected end
        if ( (comparisonActivity.start <= selectedActivity.end) && (comparisonActivity.end >= selectedActivity.end) ) return true;
        return false;
    };

    //Treat the validation as an object that offers multiple functions
    //relating to the required validation.
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
                    if ( value.length <= 13 || value.length >= 16 ) return false;
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

    //Set nameInput as focus when DOM loaded
    const nameInput = getDomElement('#name');
    nameInput.focus();

    //Set up other job field to be hidden when
    //other job from drop down not selected
    const otherJobInput = getDomElement('.other-job-role');
    otherJobInput.style.visibility = "hidden";

    const jobRoles = getDomElement('#title');
    jobRoles.addEventListener('change', function() {
        if (this.value === "other") {
            otherJobInput.style.visibility = "visible";
        } else {
            otherJobInput.style.visibility = "hidden";
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

        //Sums total price of selected activities
        Array.from(children).forEach(activity => {
            if (activity.children[0].checked) {
                cost += parseInt(activity.children[0].dataset.cost);
            }
        })
        costDisplay.textContent = "Total: $" + cost;

        //Checks for overlapping events
        //1. Get all courses that the user is attending / has checked
        let attendingCourses = [];
        Array.from(children).forEach(activity => {
            if (activity.children[0].checked) {
                const courseInfo = getCourseInfo(activity.children[1].textContent, activity.children[2].textContent);
                attendingCourses.push(courseInfo);
            }
        });

        //2. Compare all activities against those that are checked
        Array.from(children).forEach(activity => {
            // if courses have been checked then check for overlaps
            // if no courses have been checked then enable all fields
            if (attendingCourses.length > 0 ) {
                const courseInfo = getCourseInfo(activity.children[1].textContent, activity.children[2].textContent);
                let overlap = false;

                // iterate over attending courses. Ignore the identical object 
                // If overlap found then break loop (no need to evaluate 
                // further cases in outer loop)
                for (let i = 0 ; i < attendingCourses.length ; i++) {
                    if (attendingCourses[i].name !== courseInfo.name) {
                        overlap = checkForOverlap(attendingCourses[i], courseInfo);
                        if (overlap) break; 
                    }
                }

                // Disable activity if overlap is found
                if (overlap) {
                    activity.children[0].disabled = true;
                    activity.className = 'disabled';
                } else {
                    activity.children[0].disabled = false;
                    activity.className = '';
                }

            } else {
                activity.children[0].disabled = false;
            }
        });
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
    //Iterate through payment options to find which is the selected option. 
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
            setFieldSetValidity(false, 'activities', costFieldSet);
            valid = false;
        } else {
            setFieldSetValidity(true, 'activities', costFieldSet);
        }

        //Check details of card number used for payment
        const paymentFieldSet = getDomElement('.payment-methods');
        const cardNumber = getDomElement('#' + 'cc-num');
        const cardNumberParent = getParentElement(cardNumber);
        if ( !validateForm.card('cardNumber', cardNumber.value) ) {
            console.log("I am here")
            setValidity(false, cardNumberParent);
            setVisibility(false, cardNumberParent.lastElementChild);
            valid = false;
        } else {
            setValidity(true, cardNumberParent);
            setVisibility(true, cardNumberParent.lastElementChild);
        }

        //Check details of zip used for payment
        const zip = getDomElement('#' + 'zip');
        const zipParent = getParentElement(zip);
        if ( !validateForm.card('zip', zip.value) ) {
            setValidity(false, zipParent);
            setVisibility(false, zipParent.lastElementChild);
            valid = false;
        } else {
            setValidity(true, zipParent);
            setVisibility(true, zipParent.lastElementChild);
        }

        //Check details of ccv used for payment
        const ccv = getDomElement('#' + 'cvv');
        const ccvParent = getParentElement(ccv);
        if ( !validateForm.card('ccv', ccv.value) ) {
            // 
            setValidity(false, ccvParent);
            setVisibility(false, ccvParent.lastElementChild);
            valid = false;
        } else {
            setValidity(true, ccvParent);
            setVisibility(true, ccvParent.lastElementChild);
        }

        console.log(valid)
        if ( !valid ) {
            setFieldSetValidity(false, 'payment-methods', paymentFieldSet);
            event.preventDefault();
        } else {
            setFieldSetValidity(true, 'payment-methods', paymentFieldSet);
        }
    });

})
