# Build stage
FROM php:8.2-fpm AS builder

WORKDIR /var/www

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip nodejs npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Copy the entire application (including artisan) before running composer
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Install Node.js dependencies
RUN npm install

# Final stage
FROM php:8.2-fpm

WORKDIR /var/www

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy application files and dependencies from builder stage
COPY --from=builder /var/www /var/www

# Set permissions
RUN chown -R www-data:www-data /var/www

# Expose port 9000 for php-fpm
EXPOSE 9000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:9000 || exit 1

# Start php-fpm
CMD ["php-fpm"]
