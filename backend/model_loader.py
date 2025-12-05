"""
Model loader with sklearn compatibility handling
"""
import pickle
import sys
import warnings
warnings.filterwarnings('ignore')

# Pre-import all sklearn modules to ensure they're available
try:
    import sklearn
    import sklearn.tree
    import sklearn.ensemble
    import sklearn.svm
    import sklearn.linear_model
    import sklearn.naive_bayes
    import sklearn.neighbors
    import sklearn.metrics
    import sklearn.model_selection
    import sklearn.preprocessing
    import sklearn.utils
    import numpy as np
except ImportError as e:
    print(f"Warning: Could not import sklearn modules: {e}")

# Create module aliases for old sklearn paths
def setup_sklearn_aliases():
    """Setup module aliases for old sklearn module paths"""
    try:
        # Tree module aliases
        if not hasattr(sys.modules.get('sklearn.tree', {}), 'tree'):
            import sklearn.tree as tree_module
            sys.modules['sklearn.tree.tree'] = tree_module
        
        # Ensemble module aliases  
        if not hasattr(sys.modules.get('sklearn.ensemble', {}), 'forest'):
            import sklearn.ensemble as ensemble_module
            sys.modules['sklearn.ensemble.forest'] = ensemble_module
            sys.modules['sklearn.ensemble.gradient_boosting'] = ensemble_module
        
        # SVM module aliases
        if not hasattr(sys.modules.get('sklearn.svm', {}), 'classes'):
            import sklearn.svm as svm_module
            sys.modules['sklearn.svm.classes'] = svm_module
        
        # Linear model aliases
        if not hasattr(sys.modules.get('sklearn.linear_model', {}), 'base'):
            import sklearn.linear_model as linear_module
            sys.modules['sklearn.linear_model.base'] = linear_module
        
        # Neighbors aliases
        if not hasattr(sys.modules.get('sklearn.neighbors', {}), 'classification'):
            import sklearn.neighbors as neighbors_module
            sys.modules['sklearn.neighbors.classification'] = neighbors_module
            
    except Exception as e:
        print(f"Warning: Could not setup sklearn aliases: {e}")

class SklearnUnpickler(pickle.Unpickler):
    """Custom unpickler to handle sklearn module path changes"""
    
    def find_class(self, module, name):
        # Setup aliases before attempting to load
        setup_sklearn_aliases()
        
        # Handle sklearn module path changes
        if module.startswith('sklearn.'):
            # Direct class imports for common sklearn classes
            class_mappings = {
                ('sklearn.tree.tree', 'DecisionTreeClassifier'): 'sklearn.tree.DecisionTreeClassifier',
                ('sklearn.tree.tree', 'DecisionTreeRegressor'): 'sklearn.tree.DecisionTreeRegressor',
                ('sklearn.ensemble.forest', 'RandomForestClassifier'): 'sklearn.ensemble.RandomForestClassifier',
                ('sklearn.ensemble.forest', 'RandomForestRegressor'): 'sklearn.ensemble.RandomForestRegressor',
                ('sklearn.ensemble.gradient_boosting', 'GradientBoostingClassifier'): 'sklearn.ensemble.GradientBoostingClassifier',
                ('sklearn.ensemble.gradient_boosting', 'GradientBoostingRegressor'): 'sklearn.ensemble.GradientBoostingRegressor',
                ('sklearn.svm.classes', 'SVC'): 'sklearn.svm.SVC',
                ('sklearn.svm.classes', 'SVR'): 'sklearn.svm.SVR',
                ('sklearn.linear_model.base', 'LinearRegression'): 'sklearn.linear_model.LinearRegression',
                ('sklearn.linear_model.logistic', 'LogisticRegression'): 'sklearn.linear_model.LogisticRegression',
                ('sklearn.naive_bayes', 'GaussianNB'): 'sklearn.naive_bayes.GaussianNB',
                ('sklearn.neighbors.classification', 'KNeighborsClassifier'): 'sklearn.neighbors.KNeighborsClassifier',
            }
            
            # Check if we have a direct mapping
            key = (module, name)
            if key in class_mappings:
                full_path = class_mappings[key]
                module_path, class_name = full_path.rsplit('.', 1)
                try:
                    mod = __import__(module_path, fromlist=[class_name])
                    return getattr(mod, class_name)
                except (ImportError, AttributeError):
                    pass
            
            # Try to import directly from the new module structure
            try:
                if 'tree' in module and name in ['DecisionTreeClassifier', 'DecisionTreeRegressor']:
                    from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
                    return locals()[name]
                elif 'ensemble' in module:
                    if name in ['RandomForestClassifier', 'RandomForestRegressor']:
                        from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
                        return locals()[name]
                    elif name in ['GradientBoostingClassifier', 'GradientBoostingRegressor']:
                        from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
                        return locals()[name]
                elif 'svm' in module and name in ['SVC', 'SVR']:
                    from sklearn.svm import SVC, SVR
                    return locals()[name]
                elif 'linear_model' in module and name in ['LinearRegression', 'LogisticRegression']:
                    from sklearn.linear_model import LinearRegression, LogisticRegression
                    return locals()[name]
                elif 'naive_bayes' in module and name == 'GaussianNB':
                    from sklearn.naive_bayes import GaussianNB
                    return GaussianNB
                elif 'neighbors' in module and name == 'KNeighborsClassifier':
                    from sklearn.neighbors import KNeighborsClassifier
                    return KNeighborsClassifier
            except ImportError:
                pass
        
        # Fallback to original method
        return super().find_class(module, name)

def load_model_safely(model_path):
    """Load a sklearn model with compatibility handling"""
    setup_sklearn_aliases()
    
    try:
        with open(model_path, 'rb') as f:
            unpickler = SklearnUnpickler(f)
            model = unpickler.load()
        return model
    except Exception as e:
        print(f"Error loading with custom unpickler: {e}")
        # Fallback to regular pickle loading
        try:
            with open(model_path, 'rb') as f:
                return pickle.load(f)
        except Exception as e2:
            raise Exception(f"Failed to load model with both methods. Custom: {e}, Regular: {e2}")