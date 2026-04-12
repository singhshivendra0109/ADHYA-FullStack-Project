from passlib.context import CryptContext

# Create a hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Your password
plain_password = "Singh0109@"

# Generate hashed password
hashed_password = pwd_context.hash(plain_password)

print("Hashed Password:", hashed_password)
