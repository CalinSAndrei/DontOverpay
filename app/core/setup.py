from pathlib import Path
from scrapling.cli import install

def ensure_scrapling_installed():
    marker = Path.home() / ".scrapling" / ".installed"\
    
    if marker.exists():
        print('Scrapling dependencies already installed, ready to use software')
        return 
        
    print('Installing Scrapling browser dependencies...')

    install([], standalone_mode=False)   # type: ignore

    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.touch()


    print("Scrapling install complete.")

    return 


