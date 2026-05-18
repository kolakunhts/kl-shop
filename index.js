// ==========================================
// 1. LOADING SCREEN
// ==========================================
const loader = document.createElement('div');
loader.id = 'loader';
loader.className = 'loader-container';
loader.innerHTML = `<div class="loader-inner"><div class="loader-spinner"></div><p>KL SHOP</p></div>`;
document.body.prepend(loader);
window.addEventListener('load', () => {
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 600);
    }, 500);
});

// ==========================================
// 2. TEXT TYPING EFFECT
// ==========================================
const textElement = document.querySelector(".text-animation span");
const words = ["WELCOME TO KL SHOP", "欢迎光临大家", "ຍີນດີຕ້ອນຮັບ ລູກຄ້າທີ່ໜ້າຮັກທຸກທ່ານ"];
let wordIndex = 0, charIndex = 0, isDeleting = false;
function typeEffect() {
    if (!textElement) return;
    const currentWord = words[wordIndex];
    textElement.textContent = isDeleting ? currentWord.substring(0, charIndex - 1) : currentWord.substring(0, charIndex + 1);
    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    if (!isDeleting && charIndex === currentWord.length) { isDeleting = true; setTimeout(typeEffect, 2000); }
    else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; setTimeout(typeEffect, 500); }
    else { setTimeout(typeEffect, isDeleting ? 50 : 100); }
}
document.addEventListener("DOMContentLoaded", typeEffect);

// ==========================================
// 3. ລະບົບກະຕ່າສິນຄ້າ (CART ENGINE) - ແຍກຕາມສິນຄ້າ ແລະ ໄຊ
// ==========================================
let cart = [];
let discountPercent = 0;
const COUPON_CODE = "KL50"; // ໂຄ້ດສ່ວນຫຼຸດ 50% ທີ່ເຈົ້າຕັ້ງໄວ້ຢູ່ Banner

function openOrderDrawer() {
    const order = document.getElementById('order');
    const overlay = document.getElementById('order-overlay');

    if (!order || !overlay) return;
    order.classList.add('open');
    overlay.classList.add('open');
    order.setAttribute('aria-hidden', 'false');
    document.body.classList.add('order-drawer-open');
}

function closeOrderDrawer() {
    const order = document.getElementById('order');
    const overlay = document.getElementById('order-overlay');

    if (!order || !overlay) return;
    order.classList.remove('open');
    overlay.classList.remove('open');
    order.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('order-drawer-open');
}

// ຟັງຊັນເພີ່ມສິນຄ້າເຂົ້າກະຕ່າ
function addToCart(name, price, img, size, productId) {
    // ຖ້າບໍ່ໄດ້ເລືອກ Size ໃຫ້ໃສ່ເປັນ "ທົ່ວໄປ/ບໍ່ລະບຸ"
    const selectedSize = size || "ບໍ່ລະບຸໄຊ້";

    // ສ້າງ Key ພິເສດໂດຍການລວມ ຊື່ + ໄຊ ເພື່ອແຍກສິນຄ້າບໍ່ໃຫ້ຢູ່ລວມກັນ
    const cartKey = `${productId || name}-${selectedSize}`;

    // ກວດເບິ່ງວ່າມີສິນຄ້າຊື່ນີ້ ແລະ ໄຊນີ້ ໃນກະຕ່າແລ້ວຫຼືຍັງ
    const existingItem = cart.find(item => item.key === cartKey);

    if (existingItem) {
        existingItem.qty += 1; // ຖ້າມີແລ້ວໃຫ້ເພີ່ມແຕ່ຈຳນວນ
    } else {
        cart.push({
            key: cartKey,
            productId: productId || name,
            name: name,
            price: parseFloat(price.replace(/[^0-9.]/g, '')),
            img: img,
            size: selectedSize,
            qty: 1
        });
    }

    updateCartUI();
    showToastNotification(name, selectedSize, img);

    openOrderDrawer();
}

// ຟັງຊັນປັບປຸງໜ້າຕ່າງກະຕ່າສິນຄ້າ (Render UI)
function updateCartUI() {
    const tbody = document.getElementById('cart-table-body');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const badge = document.getElementById('cart-badge');
    const floatingBadge = document.getElementById('floating-cart-badge');

    if (!tbody) return;
    tbody.innerHTML = "";

    let totalQty = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        emptyMsg.style.display = "block";
    } else {
        emptyMsg.style.display = "none";

        cart.forEach((item, index) => {
            totalQty += item.qty;
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;

            tbody.innerHTML += `
                <tr>
                    <td><img src="${item.img}" class="cart-img"></td>
                    <td><p class="mb-0 fw-bold small">${item.name}</p></td>
                    <td><span class="badge bg-secondary">${item.size}</span></td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <div class="d-flex align-items-center gap-1">
                            <button class="btn btn-sm btn-outline-dark btn-qty" onclick="changeQty(${index}, -1)">-</button>
                            <span class="fw-bold px-1">${item.qty}</span>
                            <button class="btn btn-sm btn-outline-dark btn-qty" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td class="fw-bold text-dark">$${itemTotal.toFixed(2)}</td>
                    <td><button class="btn btn-sm btn-link text-danger p-0" onclick="removeFromCart(${index})"><i class="fas fa-trash-alt"></i></button></td>
                </tr>
            `;
        });
    }

    // ອັບເດດ Badge ຕົວເລກເທິງເມນູ
    if (badge) {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? "block" : "none";
    }

    if (floatingBadge) {
        floatingBadge.textContent = totalQty;
        floatingBadge.style.display = totalQty > 0 ? "grid" : "none";
    }

    // ຄຳນວນເງິນ ແລະ ສ່ວນຫຼຸດ
    const discountAmount = subtotal * (discountPercent / 100);
    const finalTotal = subtotal - discountAmount;

    document.getElementById('subtotal-price').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discount-price').textContent = `-$${discountAmount.toFixed(2)}`;
    document.getElementById('total-price').textContent = `$${finalTotal.toFixed(2)}`;
}

// ຟັງຊັນ ເພີ່ມ/ລົບ ຈຳນວນສິນຄ້າ (+/-)
window.changeQty = function (index, amount) {
    cart[index].qty += amount;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

// ຟັງຊັນ ລຶບສິນຄ້າອອກຈາກກະຕ່າ
window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

// Pop-up ແຈ້ງເຕືອນເວລາເພີ່ມສິນຄ້າ
// function showToastNotification(name, size, img) {
//     const toast = document.createElement('div');
//     toast.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: #222; color: #fff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 99999; display: flex; align-items: center; gap: 12px; font-size: 13px; animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.2s forwards;`;
//     toast.innerHTML = `<img src="${img}" style="width: 35px; height: 35px; object-fit: cover; border-radius: 4px;"><div><strong style="color: #a2daf8;">ເພີ່ມເຂົ້າກະຕ່າແລ້ວ!</strong><p style="margin:0; font-size:11px; color:#bbb;">${name} (Size: ${size})</p></div>`;
//     document.body.appendChild(toast);
//     setTimeout(() => toast.remove(), 2500);
// }

// ==========================================
// 4. QUICK VIEW MODAL (ໜ້າຕ່າງ Pop-up ເບິ່ງສິນຄ້າ)
// ==========================================
const modal = document.createElement('div');
modal.id = 'quick-view-modal';
modal.innerHTML = `
    <div class="qv-overlay"></div>
    <div class="qv-box">
        <button class="qv-close"><i class="fa-solid fa-xmark"></i></button>
        <div class="qv-content">
            <div class="qv-img"><img id="qv-img" src="" alt=""></div>
            <div class="qv-info">
                <h4 id="qv-name"></h4>
                <div class="qv-price" id="qv-price"></div>
                <div class="qv-rating"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                <p class="qv-desc">ສິນຄ້າຄຸນນະພາບສູງ, ໃສ່ສະດວກສະບາຍ, ເໝາະສຳລັບທຸກໂອກາດ.</p>
                <div class="qv-size">
                    <p><strong>ເລືອກໄຊ້ (Size):</strong></p>
                    <div class="size-btns">
                        <button class="size-opt">38</button><button class="size-opt">39</button><button class="size-opt">40</button>
                        <button class="size-opt">41</button><button class="size-opt">42</button><button class="size-opt">43</button>
                    </div>
                </div>
                <div class="qv-actions mt-3">
                    <button class="qv-add-cart"><i class="fa-solid fa-cart-shopping"></i> ເພີ່ມໃສ່ກະຕ່າ</button>
                </div>
            </div>
        </div>
    </div>
`;
document.body.appendChild(modal);

modal.querySelector('.qv-overlay').addEventListener('click', () => modal.classList.remove('open'));
modal.querySelector('.qv-close').addEventListener('click', () => modal.classList.remove('open'));

// ປຸ່ມເລືອກໄຊໃນ Modal
let selectedSizeValue = "";
let currentQuickViewProduct = null;
modal.querySelectorAll('.size-opt').forEach(btn => {
    btn.addEventListener('click', function () {
        modal.querySelectorAll('.size-opt').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedSizeValue = this.textContent;
    });
});

// ກົດແອັດສິນຄ້າຈາກໃນ Modal
modal.querySelector('.qv-add-cart').addEventListener('click', () => {
    if (!selectedSizeValue) {
        alert("ກະລຸນາເລືອກໄຊ້ເກີບກ່ອນເພີ່ມສິນຄ້າ");
        return;
    }

    const name = document.getElementById('qv-name').textContent;
    const price = document.getElementById('qv-price').textContent;
    const img = document.getElementById('qv-img').src;

    addToCart(name, price, img, selectedSizeValue, currentQuickViewProduct?.id);
    modal.classList.remove('open');
});

function getProductDataFromBox(box) {
    const allProducts = Array.from(document.querySelectorAll('.product-box'));
    const productIndex = allProducts.indexOf(box);

    return {
        id: `product-${productIndex}-${box.querySelector('img')?.getAttribute('src') || ''}`,
        name: box.querySelector('.pr-txt p')?.textContent.trim() || "KL SHOP Product",
        price: box.querySelector('.price')?.textContent.trim() || "$0.00",
        img: box.querySelector('img')?.src || ""
    };
}

function openQuickView(box) {
    if (!box) return;

    currentQuickViewProduct = getProductDataFromBox(box);
    document.getElementById('qv-img').src = currentQuickViewProduct.img;
    document.getElementById('qv-name').textContent = currentQuickViewProduct.name;
    document.getElementById('qv-price').textContent = currentQuickViewProduct.price;
    modal.querySelectorAll('.size-opt').forEach(b => b.classList.remove('selected'));
    selectedSizeValue = "";
    modal.classList.add('open');
}


// ==========================================
// 5. EVENT LISTENERS & ສົ່ງບິນເຂົ້າ WHATSAPP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // ສ້າງ Badge ໃສ່ກະຕ່າສິນຄ້າເທິງເມນູ
    const cartLink = document.querySelector('.nav-link i.fa-shopping-cart')?.parentElement;
    if (cartLink) {
        cartLink.style.position = 'relative';
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            openOrderDrawer();
        });
        const b = document.createElement('span');
        b.id = 'cart-badge';
        b.style.cssText = `position: absolute; top: -5px; right: 10px; background: red; color: white; font-size: 10px; padding: 2px 5px; border-radius: 50%; font-weight: bold; display: none;`;
        cartLink.appendChild(b);
    }

    document.getElementById('cart-toggle')?.addEventListener('click', openOrderDrawer);
    document.getElementById('close-order-btn')?.addEventListener('click', closeOrderDrawer);
    document.getElementById('order-overlay')?.addEventListener('click', closeOrderDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOrderDrawer();
    });

    // ປຸ່ມເບິ່ງດ່ວນ (ຮູບຕາ)
    document.querySelectorAll('.share-pr li a').forEach(link => {
        if (link.querySelector('.fa-eye') || link.innerHTML.includes('fa-eye')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const box = this.closest('.product-box');
                if (box) {
                    openQuickView(box);
                }
            });
        }
    });

    // ປຸ່ມ Add to Cart ສີດຳຢູ່ໜ້າເວັບ: ເປີດໜ້າເລືອກໄຊກ່ອນເພີ່ມສິນຄ້າ
    document.querySelectorAll('.nav-btn a').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const box = this.closest('.product-box');
            if (box) {
                openQuickView(box);
            } else {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ລະບົບກວດສອບລະຫັດສ່ວນຫຼຸດ
    document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
        const input = document.getElementById('coupon-input').value.trim();
        const msg = document.getElementById('coupon-msg');

        if (input.toUpperCase() === COUPON_CODE) {
            discountPercent = 50; // ຫຼຸດ 50% ຕາມປ້າຍ Banner
            msg.textContent = "✓ ນຳໃຊ້ລະຫັດສ່ວນຫຼຸດ 50% ສຳເລັດ!";
            msg.className = "small mb-3 text-success fw-bold";
        } else {
            discountPercent = 0;
            msg.textContent = "✗ ລະຫັດສ່ວນຫຼຸດບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ";
            msg.className = "small mb-3 text-danger";
        }
        updateCartUI();
    });

    // ລະບົບຢືນຢັນສັ່ງຊື້ ແລະ ອອກໃບບິນ
    document.getElementById('checkout-form')?.addEventListener('submit', function (e) {
        e.preventDefault();

        if (cart.length === 0) {
            alert("ກະລຸນາເພີ່ມສິນຄ້າໃນກະຕ່າກ່ອນອອກໃບບິນ!");
            return;
        }

        // ດຶງຂໍ້ມູນຈາກຟອມ
        const name = document.getElementById('cus-name').value;
        const phone = document.getElementById('cus-phone').value;
        const address = document.getElementById('cus-address').value;
        const shipping = document.getElementById('cus-shipping').value;

        let subtotal = 0;
        const receiptItems = cart.map((item) => {
            const total = item.price * item.qty;
            subtotal += total;

            return {
                name: item.name,
                price: item.price,
                img: item.img,
                size: item.size,
                qty: item.qty,
                total: total
            };
        });

        const discount = subtotal * (discountPercent / 100);
        const finalTotal = subtotal - discount;

        const receiptData = {
            receiptNo: `KL-${Date.now().toString().slice(-8)}`,
            createdAt: new Date().toLocaleString('lo-LA'),
            customer: {
                name,
                phone,
                address,
                shipping
            },
            items: receiptItems,
            summary: {
                subtotal,
                discountPercent,
                discount,
                shippingFee: 0,
                finalTotal
            }
        };

        localStorage.setItem('klshop_receipt', JSON.stringify(receiptData));
        window.location.href = 'receipt.html';
    });
});
