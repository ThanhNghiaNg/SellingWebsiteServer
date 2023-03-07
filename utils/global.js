exports.addStyleCurrency = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
};

exports.generateOrderMail = (user, items, totalPrice) => {
  const trItems = items.reduce((acc, item) => {
    return (
      acc +
      ` <tr>
            <td>${item.name}</td>
            <td><img src=${item.img} style="width: 5rem;padding: 0.5rem;"></td>
            <td>${this.addStyleCurrency(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${this.addStyleCurrency(item.totalPrice)}</td>
        </tr>`
    );
  }, "");
  return `<html>
            <head>
                <style>
                    td{
                        border: 1px solid #ccc!important;
                    }
                </style>
            </head>
            <body style="background-color: #343a40; color:#fff; padding: 3rem;">
                <h1>Xin chào ${user.fullName}</h1>
                
                <p>Phone: ${user.phone}</p>
                
                <p>Address: ${user.address}</p>
                
                <table>
                    <thead>
                        <tr>
                            <td>Tên sản phẩm</td>
                            <td>Hình ảnh</td>
                            <td>Giá</td>
                            <td>Số lượng</td>
                            <td>Thành tiền</td>
                        </tr>
                    </thead>
                    <tbody>
                        ${trItems}
                    </tbody>
                </table>
                <h1>Tổng Thanh Toán: ${this.addStyleCurrency(totalPrice)}</h1>
                
                <h1>Cảm ơn bạn!</h1>
            </body>
        </html>`;
};
