from flask import Flask, jsonify, request, send_from_directory, make_response
from flask_cors import CORS
import mysql.connector
import os
import uuid
import bcrypt
import json
from werkzeug.utils import secure_filename
from mysql.connector import pooling 
from PIL import Image

app = Flask(__name__)
CORS(app) 

# --- IMAGE UPLOAD CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True) 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper function to save images securely WITH AUTOMATED COMPRESSION
def save_image(file):
    if file and file.filename != '':
        original_filename = secure_filename(file.filename)
        filename_without_ext = os.path.splitext(original_filename)[0]
        
        # We append .webp to the new filename
        new_filename = f"{str(uuid.uuid4())[:8]}_{filename_without_ext}.webp" 
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        
        # 1. Open the image using Pillow
        img = Image.open(file)
        
        # 2. Convert color modes (fixes CMYK or weird formats)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
            
        # 3. Smart Resizing (Prevents massive 4K raw camera images)
        max_size = (1200, 1200)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # 4. Save as an optimized WebP (Incredible quality, tiny file size)
        img.save(filepath, format="WEBP", quality=80, optimize=True)
        
        return new_filename
    return None

# --- FIX: ADD CACHE HEADERS TO IMAGE ENDPOINT ---
@app.route('/uploads/<filename>')
def serve_image(filename):
    response = make_response(send_from_directory(app.config['UPLOAD_FOLDER'], filename))
    # Instruksikan browser untuk menyimpan cache gambar selama 1 tahun (31536000 detik)
    response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response

# --- DATABASE POOL CONFIGURATION ---
dbconfig = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "pelangi_db"
}

try:
    # Create a pool of 5 persistent connections
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="pelangi_pool",
        pool_size=5,
        pool_reset_session=True,
        **dbconfig
    )
    print("✅ Database connection pool created successfully.")
except Exception as e:
    print(f"❌ Error creating database pool: {e}")

def get_db_connection():
    # Instantly grab an open connection from the pool instead of starting from scratch
    return connection_pool.get_connection()

# ==========================================
# MASTER REORDER API (NEW: UNTUK DRAG AND DROP)
# ==========================================
@app.route('/api/<item_type>/reorder', methods=['PUT'])
def reorder_items(item_type):
    conn = None
    cursor = None
    try:
        table_map = {
            'product': 'products',
            'news': 'news_events',
            'promo': 'promos',
            'outlet': 'outlets'
        }
        table = table_map.get(item_type)
        if not table:
            return jsonify({"error": "Invalid item type"}), 400

        ordered_ids = request.json.get('ordered_ids', [])
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Loop array yang ditarik (drag) dari React dan update urutan display_order-nya
        for index, item_id in enumerate(ordered_ids):
            cursor.execute(f"UPDATE {table} SET display_order = %s WHERE id = %s", (index, item_id))
        
        conn.commit()
        return jsonify({"message": "Reordered successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 1. PROMOS API
# ==========================================
@app.route('/api/promos', methods=['GET', 'POST'])
def handle_promos():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) 
        if request.method == 'GET':
            cursor.execute("SELECT * FROM promos ORDER BY display_order ASC, id DESC") # UPDATED
            promos = cursor.fetchall()
            return jsonify(promos)
        elif request.method == 'POST':
            image_url = save_image(request.files.get('image'))
            sql = "INSERT INTO promos (title, description, validUntil, status, branch, image_url) VALUES (%s, %s, %s, %s, %s, %s)"
            values = (request.form.get('title'), request.form.get('description'), request.form.get('validUntil'), request.form.get('status', 'Active'), request.form.get('branch'), image_url)
            cursor.execute(sql, values)
            conn.commit() 
            new_id = cursor.lastrowid 
            return jsonify({"message": "Promo created!", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/promos/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_promo(id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if request.method == 'PUT':
            image_url = save_image(request.files.get('image'))
            if image_url:
                sql = "UPDATE promos SET title=%s, description=%s, validUntil=%s, status=%s, branch=%s, image_url=%s WHERE id=%s"
                values = (request.form.get('title'), request.form.get('description'), request.form.get('validUntil'), request.form.get('status'), request.form.get('branch'), image_url, id)
            else:
                sql = "UPDATE promos SET title=%s, description=%s, validUntil=%s, status=%s, branch=%s WHERE id=%s"
                values = (request.form.get('title'), request.form.get('description'), request.form.get('validUntil'), request.form.get('status'), request.form.get('branch'), id)
            cursor.execute(sql, values)
            conn.commit()
            msg = "Promo updated!"
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM promos WHERE id = %s", (id,))
            conn.commit()
            msg = "Promo deleted!"
        return jsonify({"message": msg}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. NEWS & EVENTS API
# ==========================================
@app.route('/api/news_events', methods=['GET', 'POST'])
def handle_news():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        if request.method == 'GET':
            cursor.execute("SELECT * FROM news_events ORDER BY display_order ASC, id DESC") # UPDATED
            news = cursor.fetchall()
            return jsonify(news)
        elif request.method == 'POST':
            image_url = save_image(request.files.get('image'))
            sql = "INSERT INTO news_events (title, content, date, status, image_url) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (request.form.get('title'), request.form.get('content'), request.form.get('date'), request.form.get('status', 'Published'), image_url))
            conn.commit()
            new_id = cursor.lastrowid
            return jsonify({"message": "News created!", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/news_events/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_news(id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if request.method == 'PUT':
            image_url = save_image(request.files.get('image'))
            if image_url:
                sql = "UPDATE news_events SET title=%s, content=%s, date=%s, status=%s, image_url=%s WHERE id=%s"
                values = (request.form.get('title'), request.form.get('content'), request.form.get('date'), request.form.get('status'), image_url, id)
            else:
                sql = "UPDATE news_events SET title=%s, content=%s, date=%s, status=%s WHERE id=%s"
                values = (request.form.get('title'), request.form.get('content'), request.form.get('date'), request.form.get('status'), id)
            cursor.execute(sql, values)
            conn.commit()
            msg = "News updated!"
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM news_events WHERE id = %s", (id,))
            conn.commit()
            msg = "News deleted!"
        return jsonify({"message": msg}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. OUTLETS API
# ==========================================
@app.route('/api/outlets', methods=['GET', 'POST'])
def handle_outlets():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        if request.method == 'GET':
            cursor.execute("SELECT * FROM outlets ORDER BY display_order ASC, id DESC") # UPDATED
            outlets = cursor.fetchall()
            return jsonify(outlets)
        elif request.method == 'POST':
            image_url = save_image(request.files.get('image'))
            sql = "INSERT INTO outlets (name, address, whatsapp, gmaps, image_url) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (request.form.get('name'), request.form.get('address'), request.form.get('whatsapp'), request.form.get('gmaps'), image_url))
            conn.commit()
            new_id = cursor.lastrowid
            return jsonify({"message": "Outlet created!", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/outlets/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_outlets(id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if request.method == 'PUT':
            image_url = save_image(request.files.get('image'))
            if image_url:
                sql = "UPDATE outlets SET name=%s, address=%s, whatsapp=%s, gmaps=%s, image_url=%s WHERE id=%s"
                values = (request.form.get('name'), request.form.get('address'), request.form.get('whatsapp'), request.form.get('gmaps'), image_url, id)
            else:
                sql = "UPDATE outlets SET name=%s, address=%s, whatsapp=%s, gmaps=%s WHERE id=%s"
                values = (request.form.get('name'), request.form.get('address'), request.form.get('whatsapp'), request.form.get('gmaps'), id)
            cursor.execute(sql, values)
            conn.commit()
            msg = "Outlet updated!"
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM outlets WHERE id = %s", (id,))
            conn.commit()
            msg = "Outlet deleted!"
        return jsonify({"message": msg}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. PRODUCTS API
# ==========================================
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if request.method == 'GET':
            cursor.execute("""
                SELECT p.id, p.name, p.description, p.category_id, p.base_image_url, p.price, p.brand, p.status, p.display_order,
                       c.name as category
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ORDER BY p.display_order ASC, p.id DESC
            """)
            products = cursor.fetchall()

            cursor.execute("SELECT id, product_id, variant_name, price, variant_image_url FROM product_variants")
            all_variants = cursor.fetchall()

            cursor.execute("SELECT id, variant_id, min_qty, price FROM variant_pricing_tiers ORDER BY min_qty ASC")
            all_tiers = cursor.fetchall()

            tiers_by_variant = {}
            for t in all_tiers:
                tiers_by_variant.setdefault(t['variant_id'], []).append({
                    'id': t['id'],
                    'min_qty': t['min_qty'],
                    'price': t['price']
                })

            variants_by_product = {}
            for v in all_variants:
                variants_by_product.setdefault(v['product_id'], []).append({
                    'id': v['id'],
                    'name': v['variant_name'],
                    'price': v['price'],
                    'image': v['variant_image_url'],
                    'tiers': tiers_by_variant.get(v['id'], [])
                })

            for p in products:
                p['variants'] = variants_by_product.get(p['id'], [])

            return jsonify(products)
            
        elif request.method == 'POST':
            # --- FIX: SAFE VALUE PARSING ---
            raw_cat_id = request.form.get('category_id')
            cat_id = int(raw_cat_id) if raw_cat_id and str(raw_cat_id).strip().isdigit() else 1
            
            raw_price = request.form.get('price')
            main_price = float(raw_price) if raw_price and str(raw_price).strip() != "" else 0
            
            name = request.form.get('name', 'Tanpa Nama')
            description = request.form.get('description', '')
            brand = request.form.get('brand', 'General')
            image_url = save_image(request.files.get('image'))

            # Pastikan Category ID ada
            cursor.execute("SELECT id FROM categories WHERE id = %s", (cat_id,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO categories (id, name) VALUES (%s, %s)", (cat_id, 'Category ' + str(cat_id)))
                conn.commit()

            sql_prod = "INSERT INTO products (name, description, category_id, base_image_url, price, brand) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(sql_prod, (name, description, cat_id, image_url, main_price, brand))
            new_prod_id = cursor.lastrowid
            
            i = 0
            variants_count = 0
            while f'variant_name_{i}' in request.form:
                v_name = request.form.get(f'variant_name_{i}')
                raw_v_price = request.form.get(f'variant_price_{i}')
                v_price = float(raw_v_price) if raw_v_price and str(raw_v_price).strip() != "" else main_price
                
                if v_name and v_name.strip() != "":
                    v_file = request.files.get(f'variant_image_{i}')
                    v_image_url = save_image(v_file) if v_file else None
                    sql_var = "INSERT INTO product_variants (product_id, variant_name, price, variant_image_url) VALUES (%s, %s, %s, %s)"
                    cursor.execute(sql_var, (new_prod_id, v_name.strip(), v_price, v_image_url))
                    
                    new_var_id = cursor.lastrowid 
                    variants_count += 1

                    # Simpan Tiers Grosir jika ada
                    j = 0
                    while f'variant_tier_min_qty_{i}_{j}' in request.form:
                        raw_t_min = request.form.get(f'variant_tier_min_qty_{i}_{j}')
                        raw_t_price = request.form.get(f'variant_tier_price_{i}_{j}')
                        
                        if raw_t_min and raw_t_price and str(raw_t_min).strip() != "" and str(raw_t_price).strip() != "":
                            t_min_qty = int(raw_t_min)
                            t_price = float(raw_t_price)
                            sql_tier = "INSERT INTO variant_pricing_tiers (variant_id, min_qty, price) VALUES (%s, %s, %s)"
                            cursor.execute(sql_tier, (new_var_id, t_min_qty, t_price))
                        j += 1
                i += 1
            
            if variants_count == 0:
                sql_var = "INSERT INTO product_variants (product_id, variant_name, price) VALUES (%s, %s, %s)"
                cursor.execute(sql_var, (new_prod_id, 'Default', main_price))
            
            conn.commit()
            return jsonify({"message": "Product created!", "id": new_prod_id}), 201
            
    except Exception as e:
        print(f"❌ Error in handle_products: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/products/<int:id>', methods=['PUT', 'DELETE'])
def update_delete_products(id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'PUT':
            image_url = save_image(request.files.get('image'))
            
            raw_cat_id = request.form.get('category_id')
            cat_id = int(raw_cat_id) if raw_cat_id and str(raw_cat_id).strip().isdigit() else 1
            
            raw_price = request.form.get('price')
            update_price = float(raw_price) if raw_price and str(raw_price).strip() != "" else 0
            
            update_brand = request.form.get('brand', 'General')
            update_name = request.form.get('name', 'Tanpa Nama')
            update_desc = request.form.get('description', '')
            
            if image_url:
                sql = "UPDATE products SET name=%s, description=%s, category_id=%s, base_image_url=%s, price=%s, brand=%s WHERE id=%s"
                values = (update_name, update_desc, cat_id, image_url, update_price, update_brand, id)
            else:
                sql = "UPDATE products SET name=%s, description=%s, category_id=%s, price=%s, brand=%s WHERE id=%s"
                values = (update_name, update_desc, cat_id, update_price, update_brand, id)
                
            cursor.execute(sql, values)
            
            # Hapus varian lama
            cursor.execute("DELETE FROM product_variants WHERE product_id = %s", (id,))

            i = 0
            variants_count = 0
            while f'variant_name_{i}' in request.form:
                v_name = request.form.get(f'variant_name_{i}')
                raw_v_price = request.form.get(f'variant_price_{i}')
                v_price = float(raw_v_price) if raw_v_price and str(raw_v_price).strip() != "" else update_price
                existing_image = request.form.get(f'existing_variant_image_{i}')
                
                if v_name and v_name.strip() != "":
                    v_file = request.files.get(f'variant_image_{i}')
                    v_image_url = save_image(v_file) if v_file else existing_image
                    sql_var = "INSERT INTO product_variants (product_id, variant_name, price, variant_image_url) VALUES (%s, %s, %s, %s)"
                    cursor.execute(sql_var, (id, v_name.strip(), v_price, v_image_url))
                    
                    new_var_id = cursor.lastrowid
                    variants_count += 1

                    j = 0
                    while f'variant_tier_min_qty_{i}_{j}' in request.form:
                        raw_t_min = request.form.get(f'variant_tier_min_qty_{i}_{j}')
                        raw_t_price = request.form.get(f'variant_tier_price_{i}_{j}')
                        
                        if raw_t_min and raw_t_price and str(raw_t_min).strip() != "" and str(raw_t_price).strip() != "":
                            t_min_qty = int(raw_t_min)
                            t_price = float(raw_t_price)
                            sql_tier = "INSERT INTO variant_pricing_tiers (variant_id, min_qty, price) VALUES (%s, %s, %s)"
                            cursor.execute(sql_tier, (new_var_id, t_min_qty, t_price))
                        j += 1
                i += 1
            
            if variants_count == 0:
                sql_var = "INSERT INTO product_variants (product_id, variant_name, price) VALUES (%s, %s, %s)"
                cursor.execute(sql_var, (id, 'Default', update_price))

            conn.commit()
            msg = "Product and variants updated!"
            
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM products WHERE id = %s", (id,))
            conn.commit()
            msg = "Product deleted!"
            
        return jsonify({"message": msg}), 200
    except Exception as e:
        print(f"❌ Error in update_delete_products: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
    
# ==========================================
# MASTER VISIBILITY TOGGLE API
# ==========================================
@app.route('/api/<item_type>/<int:id>/toggle', methods=['PUT'])
def toggle_visibility(item_type, id):
    conn = None
    cursor = None
    try:
        table_map = {
            'product': 'products',
            'news': 'news_events',
            'promo': 'promos',
            'outlet': 'outlets'
        }
        table = table_map.get(item_type)
        if not table:
            return jsonify({"error": "Invalid item type"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(f"SELECT status FROM {table} WHERE id = %s", (id,))
        item = cursor.fetchone()
        
        if item:
            current_status = item['status']
            if item_type == 'news':
                new_status = 'Unpublished' if current_status == 'Published' else 'Published'
            else: 
                new_status = 'Inactive' if current_status == 'Active' else 'Active'
                
            cursor.execute(f"UPDATE {table} SET status = %s WHERE id = %s", (new_status, id))
            conn.commit()
            msg = f"Item is now {new_status}"
        else:
            msg = "Item not found"

        return jsonify({"message": msg}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
    
# ==========================================
# 5. CATEGORIES API (NEW)
# ==========================================
@app.route('/api/categories', methods=['GET', 'POST'])
def handle_categories():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if request.method == 'GET':
            cursor.execute("SELECT * FROM categories ORDER BY name ASC")
            categories = cursor.fetchall()
            return jsonify(categories)
            
        elif request.method == 'POST':
            new_cat_name = request.json.get('name')
            if not new_cat_name:
                return jsonify({"error": "Category name is required"}), 400
                
            cursor.execute("SELECT id FROM categories WHERE LOWER(name) = LOWER(%s)", (new_cat_name,))
            if cursor.fetchone():
                return jsonify({"error": "Category already exists!"}), 400
                
            cursor.execute("INSERT INTO categories (name) VALUES (%s)", (new_cat_name,))
            conn.commit()
            new_id = cursor.lastrowid
            return jsonify({"message": "Category created!", "id": new_id}), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
    
@app.route('/api/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    conn = None
    cursor = None
    try:
        # Prevent deleting the hardcoded Morning Star category
        if id == 1:
            return jsonify({"error": "Cannot delete the default Morning Star category!"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SAFETY CHECK: Don't delete if products are currently using this category
        cursor.execute("SELECT id FROM products WHERE category_id = %s", (id,))
        if cursor.fetchone():
            return jsonify({"error": "Cannot delete! There are products using this category. Reassign them first."}), 400
            
        cursor.execute("DELETE FROM categories WHERE id = %s", (id,))
        conn.commit()
        
        return jsonify({"message": "Category deleted!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 6. ADMIN AUTHENTICATION API
# ==========================================
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    conn = None
    cursor = None
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
        admin = cursor.fetchone()

        if admin and bcrypt.checkpw(password.encode('utf-8'), admin['password_hash'].encode('utf-8')):
            token = "pelangi_auth_" + str(uuid.uuid4())
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/admin/change-password', methods=['POST'])
def admin_change_password():
    conn = None
    cursor = None
    try:
        data = request.json
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        username = 'admin' 

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
        admin = cursor.fetchone()

        if admin and bcrypt.checkpw(current_password.encode('utf-8'), admin['password_hash'].encode('utf-8')):
            hashed_new = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("UPDATE admins SET password_hash = %s WHERE username = %s", (hashed_new.decode('utf-8'), username))
            conn.commit()
            msg = "Password updated successfully!"
            status = 200
        else:
            msg = "Kata sandi saat ini salah." 
            status = 401
        
        return jsonify({"message": msg}), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

if __name__ == '__main__':
    print("🚀 Starting Pelangi Backend on http://localhost:5000")
    # UPDATED: threaded=True lets the dev server handle multiple requests concurrently 
    app.run(port=5000, debug=True, threaded=True)