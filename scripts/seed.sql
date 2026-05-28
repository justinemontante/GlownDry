-- Inventory
INSERT INTO inventory (item, stock, unit, threshold) VALUES
('Premium Detergent (Liquid)', 45, 'Liters', 20),
('Fabric Softener', 12, 'Liters', 15),
('Dry Cleaning Solvent', 8, 'Gallons', 10),
('Packaging Bags (Large)', 500, 'Units', 200),
('Hangers', 1200, 'Units', 300);

-- Customers (plaintext password)
INSERT INTO customers (full_name, email, phone, password) VALUES
('Maria Santos', 'maria.santos@email.com', '09171234567', 'test123'),
('Juan dela Cruz', 'juan.delacruz@email.com', '09181234567', 'test123'),
('Ana Gonzales', 'ana.gonzales@email.com', '09191234567', 'test123'),
('Pedro Reyes', 'pedro.reyes@email.com', '09201234567', 'test123'),
('Luisa Tan', 'luisa.tan@email.com', '09211234567', 'test123'),
('Carlos Villanueva', 'carlos.villanueva@email.com', '09221234567', 'test123'),
('Sofia Lopez', 'sofia.lopez@email.com', '09231234567', 'test123'),
('Miguel Fernandez', 'miguel.fernandez@email.com', '09241234567', 'test123');

-- Bookings
INSERT INTO bookings (customer_id, service_id, scheduled_date, weight_kg, notes, status, total_amount) VALUES
(1, 1, NOW() - INTERVAL '14 days' + INTERVAL '9 hours', 5, 'Please fold neatly', 'claimed', 250),
(2, 2, NOW() - INTERVAL '10 days' + INTERVAL '10 hours', 3, NULL, 'claimed', 360),
(3, 3, NOW() - INTERVAL '7 days' + INTERVAL '11 hours', 7, 'Rush order', 'claimed', 560),
(4, 4, NOW() - INTERVAL '5 days' + INTERVAL '13 hours', 4, 'Hand wash only', 'ready', 360),
(5, 1, NOW() - INTERVAL '3 days' + INTERVAL '9 hours', 8, NULL, 'ready', 400),
(6, 2, NOW() - INTERVAL '2 days' + INTERVAL '14 hours', 2, NULL, 'in_progress', 240),
(7, 3, NOW() - INTERVAL '1 day' + INTERVAL '15 hours', 6, 'Please fold neatly', 'in_progress', 480),
(8, 4, NOW() + INTERVAL '0 days' + INTERVAL '9 hours', 5, NULL, 'received', 450),
(1, 1, NOW() + INTERVAL '1 day' + INTERVAL '10 hours', 10, NULL, 'received', 500),
(2, 2, NOW() + INTERVAL '2 days' + INTERVAL '11 hours', 4, 'Dry clean only', 'scheduled', 480),
(3, 3, NOW() + INTERVAL '3 days' + INTERVAL '13 hours', 7, NULL, 'scheduled', 560),
(4, 4, NOW() + INTERVAL '5 days' + INTERVAL '9 hours', 3, 'Please fold neatly', 'scheduled', 270),
(5, 1, NOW() + INTERVAL '7 days' + INTERVAL '14 hours', 9, NULL, 'scheduled', 450),
(6, 2, NOW() + INTERVAL '10 days' + INTERVAL '10 hours', 5, NULL, 'scheduled', 600),
(7, 3, NOW() + INTERVAL '14 days' + INTERVAL '11 hours', 6, NULL, 'scheduled', 480);

-- Booking Items
INSERT INTO booking_items (booking_id, clothing_type, quantity) VALUES
(1, 'Shirt', 3), (1, 'Pants', 2), (1, 'Towel', 5),
(2, 'Jacket', 1), (2, 'Dress', 2),
(3, 'Shirt', 5), (3, 'Pants', 3), (3, 'Bed Sheet', 2),
(4, 'Dress', 2), (4, 'Skirt', 1), (4, 'Blouse', 3),
(5, 'Shirt', 8), (5, 'Pants', 4),
(6, 'Polo', 2), (6, 'Towel', 1),
(7, 'Shirt', 4), (7, 'Pants', 2), (7, 'Jacket', 1), (7, 'Bed Sheet', 1),
(8, 'Shirt', 3), (8, 'Pants', 2), (8, 'Towel', 4),
(9, 'Shirt', 6), (9, 'Pants', 4), (9, 'Bed Sheet', 2), (9, 'Towel', 3),
(10, 'Dress', 2), (10, 'Jacket', 1),
(11, 'Shirt', 4), (11, 'Pants', 3), (11, 'Towel', 5),
(12, 'Skirt', 2), (12, 'Blouse', 2),
(13, 'Shirt', 5), (13, 'Pants', 3), (13, 'Bed Sheet', 2), (13, 'Polo', 3),
(14, 'Jacket', 2), (14, 'Dress', 1), (14, 'Pants', 2),
(15, 'Shirt', 4), (15, 'Pants', 2), (15, 'Towel', 3), (15, 'Bed Sheet', 1);

-- Payments (for claimed bookings)
INSERT INTO payments (booking_id, amount, cash_received, change) VALUES
(1, 250, 300, 50),
(2, 360, 400, 40),
(3, 560, 600, 40),
(4, 360, 500, 140),
(5, 400, 500, 100);

-- Notifications
INSERT INTO notifications (customer_id, title, message, is_read) VALUES
(1, 'Order Status Update', 'Your order #ORD-0001 is now ready for pickup.', true),
(2, 'Order Status Update', 'Your order #ORD-0002 is now ready for pickup.', true),
(3, 'Order Status Update', 'Your order #ORD-0003 is now ready for pickup.', true),
(4, 'Order Status Update', 'Your order #ORD-0004 is now being processed.', false),
(5, 'Order Status Update', 'Your order #ORD-0005 is now being processed.', false),
(6, 'Order Status Update', 'Your order #ORD-0006 has been received.', false);
