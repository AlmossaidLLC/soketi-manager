#!/bin/sh
set -e

CONFIG_DIR="/app/config"
CONFIG_FILE="$CONFIG_DIR/soketi.json"
DEFAULT_CONFIG_FILE="/app/soketi.json.default"

# If config file doesn't exist, initialize it with default config
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📝 Initializing soketi.json config file..."
    
    # Ensure config directory exists (volume mount point)
    mkdir -p "$CONFIG_DIR"
    
    # Use default config file if it exists, otherwise create inline
    if [ -f "$DEFAULT_CONFIG_FILE" ]; then
        cp "$DEFAULT_CONFIG_FILE" "$CONFIG_FILE"
    else
        # Fallback: create config directly if default doesn't exist
        cat > "$CONFIG_FILE" << 'EOF'
{
  "debug": true,
  "port": 6001,
  "httpApi": {
    "port": 9601
  },
  "appManager": {
    "driver": "array",
    "cache": {
      "enabled": false
    },
    "array": {
      "apps": []
    }
  }
}
EOF
    fi
    echo "✅ Config file initialized at $CONFIG_FILE"
else
    echo "✅ Using existing config file at $CONFIG_FILE"
fi

# Execute the main command
exec "$@"
