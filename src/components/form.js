export const sendCheckoutEmail = async (checkoutFormData, cartItems, transaction, totalAmount) => {
    // FormSubmit version (for now)
    const form = document.createElement("form");
    form.action = "https://formsubmit.co/pheenixgraphix@gmail.com";
    form.method = "POST";
    form.style.display = "none";


    const createInput = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        return input;
    };

    // ADD USERS DETAILS
    const userFields = {
        'Transaction Reference': transaction,
        'Full Name': `${checkoutFormData.firstName} ${checkoutFormData.lastName}`,
        'Email': checkoutFormData.email,
        'Phone': checkoutFormData.phoneNumber,
        'Delivery Address': checkoutFormData.address,
        'Total Amount Paid': `${(totalAmount / 100).toLocaleString()}`
    };

    for (let key in userFields) {
        form.appendChild(createInput(key, userFields[key]));
    }

    // ADD CART ITEMS
   const cartSummary = cartItems.map((item, index) => {
        return `Item ${index + 1}:
    - Name: ${item.name}
    - Quantity: ${item.quantity}
    - Size: ${item.size}
    - Price: ${item.price}
    - Image: ${item.image || "N/A"}\n`;
    }).join("\n");
    form.appendChild(createInput("Cart Summary", cartSummary));

    // DISABLES CAPTCHA
    form.appendChild(createInput("_captcha", "false"));
    // DISABLES REDIRECT
    form.appendChild(createInput("_redirect", "false"));
    

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};