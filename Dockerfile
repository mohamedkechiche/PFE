# Build stage
FROM php:8.2-fpm AS builder

WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip nodejs npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Copy only composer files first for caching
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Copy package.json and package-lock.json (if using Node.js)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Final stage
FROM php:8.2-fpm

WORKDIR /var/www

# Install only runtime dependencies (minimal set)
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Composer binary from builder stage
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Copy application files and dependencies from builder stage
COPY --from=builder /var/www /var/www

# Permissions
RUN chown -R www-data:www-data /var/www

# Expose port 9000 for php-fpm
EXPOSE 9000

CMD ["php-fpm"]
