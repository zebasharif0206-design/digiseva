import sqlite3
from typing import Optional, Tuple, Union

def get_db_connection():
    """Get database connection"""
    return sqlite3.connect('db/services.db')

def authenticate_user(username: str, password: str) -> Optional[Tuple]:
    """Authenticate user login"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, username, email, user_type 
            FROM users 
            WHERE username = ? AND password = ?
        """, (username, password))
        
        user = cursor.fetchone()
        conn.close()
        
        return user
        
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

def register_user(username: str, password: str, email: str, phone: str, location: str, user_type: str, professional_data: dict = None) -> Tuple[bool, str]:
    """Register a new user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Username already exists"
        
        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return False, "Email already registered"
        
        # Insert new user
        if user_type == "professional" and professional_data:
            cursor.execute("""
                INSERT INTO users (username, password, email, phone, location, user_type, 
                                 full_name, bio, specializations, certifications, work_history, 
                                 portfolio_links, hourly_rate, service_areas, languages_spoken,
                                 experience_years, availability)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (username, password, email, phone, location, user_type,
                  professional_data.get('full_name', ''),
                  professional_data.get('bio', ''),
                  professional_data.get('specializations', ''),
                  professional_data.get('certifications', ''),
                  professional_data.get('work_history', ''),
                  professional_data.get('portfolio_links', ''),
                  professional_data.get('hourly_rate', 25.0),
                  professional_data.get('service_areas', ''),
                  professional_data.get('languages_spoken', ''),
                  professional_data.get('experience_years', 1),
                  professional_data.get('availability', 'available')))
        else:
            cursor.execute("""
                INSERT INTO users (username, password, email, phone, location, user_type)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (username, password, email, phone, location, user_type))
        
        conn.commit()
        conn.close()
        
        return True, f"Account created successfully! Welcome {username}!"
        
    except Exception as e:
        print(f"Registration error: {e}")
        return False, f"Registration failed: {str(e)}"

def change_password(user_id: int, old_password: str, new_password: str) -> Tuple[bool, str]:
    """Change user password"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify old password
        cursor.execute("SELECT id FROM users WHERE id = ? AND password = ?", (user_id, old_password))
        if not cursor.fetchone():
            conn.close()
            return False, "Current password is incorrect"
        
        # Update password
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_password, user_id))
        
        conn.commit()
        conn.close()
        
        return True, "Password changed successfully"
        
    except Exception as e:
        print(f"Password change error: {e}")
        return False, f"Failed to change password: {str(e)}"

def get_user_profile(user_id: int) -> Optional[Tuple]:
    """Get user profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, username, email, phone, location, user_type, created_at
            FROM users 
            WHERE id = ?
        """, (user_id,))
        
        profile = cursor.fetchone()
        conn.close()
        
        return profile
        
    except Exception as e:
        print(f"Profile fetch error: {e}")
        return None

def update_user_profile(user_id: int, email: str, phone: str, location: str) -> Tuple[bool, str]:
    """Update user profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users 
            SET email = ?, phone = ?, location = ?
            WHERE id = ?
        """, (email, phone, location, user_id))
        
        conn.commit()
        conn.close()
        
        return True, "Profile updated successfully"
        
    except Exception as e:
        print(f"Profile update error: {e}")
        return False, f"Failed to update profile: {str(e)}"

def get_professional_profile(user_id: int) -> Optional[dict]:
    """Get detailed professional profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT username, email, phone, location, full_name, bio, specializations,
                   certifications, work_history, portfolio_links, hourly_rate, 
                   service_areas, languages_spoken, experience_years, availability, rating
            FROM users 
            WHERE id = ? AND user_type = 'professional'
        """, (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'username': result[0],
                'email': result[1], 
                'phone': result[2],
                'location': result[3],
                'full_name': result[4],
                'bio': result[5],
                'specializations': result[6],
                'certifications': result[7],
                'work_history': result[8],
                'portfolio_links': result[9],
                'hourly_rate': result[10],
                'service_areas': result[11],
                'languages_spoken': result[12],
                'experience_years': result[13],
                'availability': result[14],
                'rating': result[15]
            }
        return None
        
    except Exception as e:
        print(f"Profile fetch error: {e}")
        return None

def update_professional_profile(user_id: int, profile_data: dict) -> Tuple[bool, str]:
    """Update professional profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users 
            SET full_name = ?, bio = ?, specializations = ?, certifications = ?,
                work_history = ?, portfolio_links = ?, hourly_rate = ?, 
                service_areas = ?, languages_spoken = ?, experience_years = ?, 
                availability = ?
            WHERE id = ?
        """, (
            profile_data.get('full_name', ''),
            profile_data.get('bio', ''),
            profile_data.get('specializations', ''),
            profile_data.get('certifications', ''),
            profile_data.get('work_history', ''),
            profile_data.get('portfolio_links', ''),
            profile_data.get('hourly_rate', 25.0),
            profile_data.get('service_areas', ''),
            profile_data.get('languages_spoken', ''),
            profile_data.get('experience_years', 1),
            profile_data.get('availability', 'available'),
            user_id
        ))
        
        conn.commit()
        conn.close()
        
        return True, "Professional profile updated successfully"
        
    except Exception as e:
        print(f"Professional profile update error: {e}")
        return False, f"Failed to update profile: {str(e)}"
