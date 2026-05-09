cd ~/fiscaalai
cat > index.js << 'EOF'
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
EOF
