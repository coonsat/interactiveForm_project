

//when document loaded, set name be in focus
document.addEventListener("DOMContentLoaded", function() {

    const getDomElement = value => {
        return document.querySelector(value);
    }

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
    activities.addEventListener('change', function() {
        let costDisplay = getDomElement('#activities-cost');
        costDisplay.textContent = "";
        let cost = 0;
        let children = this.children.item(1).children;
        Array.from(children).forEach(activity => {
            if (activity.children[0].checked) {
                cost += parseInt(activity.children[0].dataset.cost);
            }
        })
        costDisplay.textContent = "Total: $" + cost;
    });

    //7.
    //Set up credit card payment section
    const payment = getDomElement('#payment');
    Array.from(payment.options).forEach(option => {
        if (option.value === "credit-card") {
            option.selected = true;
        } else {
            let element = getDomElement('.' + option.value);
            if (element) element.style.display = "none";
        }
    })
    payment.addEventListener('change', function() {
        Array.from(payment.options).forEach(option => {
            let element = getDomElement('#' + this.value);
            if (option.value === this.value) {
                element.style.display = "block";
            } else {
                element.style.display = "none"
                console.log(option.value + ' : ' + this.value)

                console.log(element);
            }
        })
    })

})
