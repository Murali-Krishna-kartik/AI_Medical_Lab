"""
Sklearn compatibility module to handle version differences
"""
import sys
import warnings
warnings.filterwarnings('ignore')

# Handle sklearn module path changes between versions
def fix_sklearn_imports():
    """Fix sklearn import paths for compatibility with different versions"""
    try:
        # Try to import and fix tree module
        try:
            import sklearn.tree.tree as tree
        except ImportError:
            import sklearn.tree._tree as tree
            sys.modules['sklearn.tree.tree'] = tree
        
        # Try to import and fix ensemble modules
        try:
            import sklearn.ensemble.forest as forest
        except ImportError:
            import sklearn.ensemble._forest as forest
            sys.modules['sklearn.ensemble.forest'] = forest
        
        try:
            import sklearn.ensemble.gradient_boosting as gb
        except ImportError:
            import sklearn.ensemble._gb as gb
            sys.modules['sklearn.ensemble.gradient_boosting'] = gb
        
        # Try to import and fix other common modules
        try:
            import sklearn.utils.fixes as fixes
        except ImportError:
            pass
            
        try:
            import sklearn.externals.joblib as joblib
        except ImportError:
            import joblib
            sys.modules['sklearn.externals.joblib'] = joblib
            
    except Exception as e:
        # If any import fails, just continue
        pass

# Call the fix function when this module is imported
fix_sklearn_imports()