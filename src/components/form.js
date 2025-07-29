export const sendCheckoutEmail = async (tripleChiUserDetails, cartItems, transactionRef, totalAmount) => {
    // FormSubmit version (for now)
    const form = document.createElement("form");
    form.action = "https://formsubmit.co/71075a70586bc496f992c740db16eaa5";
    form.method = "POST";
    form.style.display = "none";

    // ADD USERS DETAILS
    const userFields = {
        'Transaction Reference': transactionRef,
        'Full Name': tripleChiUserDetails?.firstName + " " + tripleChiUserDetails?.lastName,
        'Email': tripleChiUserDetails?.email,
        'Phone': tripleChiUserDetails?.phoneNumber,
        'Delivery Address': tripleChiUserDetails?.address,
        'Total Amount Paid': `₦${(totalAmount / 100).toLocaleString()}`
    };

    for (let key in userFields) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = userFields[key];
        form.appendChild(input);
    }

    // ADD CART ITEMS
    const createInput = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        return input;
    };

    const shoppingCart = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
        image: item.image,
    }))

    //APPEND TO FORM INPUTS
    form.appendChild(createInput("Cart Contents", JSON.stringify(shoppingCart, null, 2)));

    

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};