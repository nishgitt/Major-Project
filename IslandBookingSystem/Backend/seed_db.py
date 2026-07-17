import db
import sqlite3

def seed():
    print("Clearing existing database tables...")
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS customers")
    cursor.execute("DROP TABLE IF EXISTS islands")
    cursor.execute("DROP TABLE IF EXISTS packages")
    cursor.execute("DROP TABLE IF EXISTS bookings")
    cursor.execute("DROP TABLE IF EXISTS payments")
    conn.commit()
    conn.close()

    print("Re-initializing Database tables...")
    db.initialize_db()
    
    # 1. Customers
    print("Seeding customer accounts...")
    db.add_customer("Rahul Sharma", "rahul@gmail.com", "9876543210", "Indian", "rahul123", 101)
    db.add_customer("Anjali Rao", "anjali@gmail.com", "9812345678", "Indian", "anjali123", 102)

    # 2. Islands
    print("Seeding island destinations...")
    db.add_island(
        island_name="Maldives",
        country="Maldives",
        description="A tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands.",
        climate="Tropical",
        best_season="November to April",
        image_url="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&auto=format&fit=crop",
        island_id=201
    )
    
    db.add_island(
        island_name="Bora Bora",
        country="French Polynesia",
        description="Stunning lagoon surrounded by sand-fringed islets and an extinct volcano, offering ultimate luxury overwater stays.",
        climate="Tropical Marine",
        best_season="May to October",
        image_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
        island_id=202
    )

    db.add_island(
        island_name="Santorini",
        country="Greece",
        description="World-famous volcanic caldera with blue-domed white houses overlooking the pristine waters of the Aegean Sea.",
        climate="Mediterranean",
        best_season="April to October",
        image_url="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop",
        island_id=203
    )

    db.add_island(
        island_name="Bali",
        country="Indonesia",
        description="Indonesian paradise renowned for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.",
        climate="Warm Tropical",
        best_season="April to October",
        image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop",
        island_id=204
    )

    db.add_island(
        island_name="Hawaii",
        country="USA",
        description="Volcanic archipelago in the Central Pacific, famous for its towering cliffs, waterfalls, and tropical sand beaches.",
        climate="Tropical",
        best_season="April to September",
        image_url="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop",
        island_id=205
    )

    db.add_island(
        island_name="Seychelles",
        country="Seychelles",
        description="Archipelago of 115 islands in the Indian Ocean, home to numerous beaches, coral reefs, and rare giant tortoises.",
        climate="Tropical Rainforest",
        best_season="April to November",
        image_url="https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&auto=format&fit=crop",
        island_id=206
    )

    # 3. Packages
    print("Seeding vacation tariff packages...")
    db.add_package(
        island_name="Maldives",
        resort_name="Sunset Paradise Resort",
        package_name="Luxury Honeymoon Package",
        duration="5 Days / 4 Nights",
        price=150000.0,
        included_services="Accommodation, Breakfast, Airport Pickup, Island Tour",
        package_id=301
    )

    db.add_package(
        island_name="Bora Bora",
        resort_name="St. Regis Overwater Resort",
        package_name="Premium Overwater Villa Retreat",
        duration="6 Days / 5 Nights",
        price=240000.0,
        included_services="Accommodation, Breakfast, Airport Pickup, Island Tour, Water Sports, Dinner",
        package_id=302
    )

    db.add_package(
        island_name="Santorini",
        resort_name="Grace Hotel Santorini",
        package_name="Scenic Caldera View Getaway",
        duration="4 Days / 3 Nights",
        price=180000.0,
        included_services="Accommodation, Breakfast, Airport Pickup, Island Tour, Dinner",
        package_id=303
    )

    db.add_package(
        island_name="Bali",
        resort_name="Maya Ubud Resort & Spa",
        package_name="Ubud Jungle & Beach Experience",
        duration="7 Days / 6 Nights",
        price=95000.0,
        included_services="Accommodation, Breakfast, Airport Pickup, Island Tour",
        package_id=304
    )

    db.add_package(
        island_name="Hawaii",
        resort_name="Grand Wailea Maui",
        package_name="Maui Aloha Beach Adventure",
        duration="6 Days / 5 Nights",
        price=190000.0,
        included_services="Accommodation, Breakfast, Airport Pickup, Water Sports",
        package_id=305
    )

    # 4. Bookings & 5. Payments
    print("Seeding transactions ledger entries...")
    db.add_booking(
        customer_name="Rahul Sharma",
        island_name="Maldives",
        package_name="Luxury Honeymoon Package",
        travel_date="2026-12-20",
        number_of_people=2,
        total_amount=150000.0,
        booking_status="Confirmed",
        booking_id=401
    )

    db.add_payment(
        booking_id=401,
        customer_name="Rahul Sharma",
        amount=150000.0,
        payment_method="Credit Card",
        payment_status="Success",
        transaction_id="TXN123456789",
        payment_date="2026-11-15",
        payment_id=501
    )
    
    print("Seeding database successfully complete with rich destinations catalog!")

if __name__ == '__main__':
    seed()
