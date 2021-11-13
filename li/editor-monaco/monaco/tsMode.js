import { e as editor, U as Uri, M as MarkerTag, a as MarkerSeverity, R as Range, l as languages, t as typescriptDefaults } from "./index.js";
var __awaiter$1 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator$1 = globalThis && globalThis.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var WorkerManager = function() {
  function WorkerManager2(modeId, defaults) {
    var _this = this;
    this._modeId = modeId;
    this._defaults = defaults;
    this._worker = null;
    this._client = null;
    this._configChangeListener = this._defaults.onDidChange(function() {
      return _this._stopWorker();
    });
    this._updateExtraLibsToken = 0;
    this._extraLibsChangeListener = this._defaults.onDidExtraLibsChange(function() {
      return _this._updateExtraLibs();
    });
  }
  WorkerManager2.prototype._stopWorker = function() {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  };
  WorkerManager2.prototype.dispose = function() {
    this._configChangeListener.dispose();
    this._extraLibsChangeListener.dispose();
    this._stopWorker();
  };
  WorkerManager2.prototype._updateExtraLibs = function() {
    return __awaiter$1(this, void 0, void 0, function() {
      var myToken, proxy;
      return __generator$1(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this._worker) {
              return [2];
            }
            myToken = ++this._updateExtraLibsToken;
            return [4, this._worker.getProxy()];
          case 1:
            proxy = _a.sent();
            if (this._updateExtraLibsToken !== myToken) {
              return [2];
            }
            proxy.updateExtraLibs(this._defaults.getExtraLibs());
            return [2];
        }
      });
    });
  };
  WorkerManager2.prototype._getClient = function() {
    var _this = this;
    if (!this._client) {
      this._worker = editor.createWebWorker({
        moduleId: "vs/language/typescript/tsWorker",
        label: this._modeId,
        keepIdleModels: true,
        createData: {
          compilerOptions: this._defaults.getCompilerOptions(),
          extraLibs: this._defaults.getExtraLibs(),
          customWorkerPath: this._defaults.workerOptions.customWorkerPath,
          inlayHintsOptions: this._defaults.inlayHintsOptions
        }
      });
      var p = this._worker.getProxy();
      if (this._defaults.getEagerModelSync()) {
        p = p.then(function(worker) {
          if (_this._worker) {
            return _this._worker.withSyncedResources(editor.getModels().filter(function(model) {
              return model.getLanguageId() === _this._modeId;
            }).map(function(model) {
              return model.uri;
            }));
          }
          return worker;
        });
      }
      this._client = p;
    }
    return this._client;
  };
  WorkerManager2.prototype.getLanguageServiceWorker = function() {
    var _this = this;
    var resources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      resources[_i] = arguments[_i];
    }
    var _client;
    return this._getClient().then(function(client) {
      _client = client;
    }).then(function(_) {
      if (_this._worker) {
        return _this._worker.withSyncedResources(resources);
      }
    }).then(function(_) {
      return _client;
    });
  };
  return WorkerManager2;
}();
var libFileSet = {};
libFileSet["lib.d.ts"] = true;
libFileSet["lib.dom.d.ts"] = true;
libFileSet["lib.dom.iterable.d.ts"] = true;
libFileSet["lib.es2015.collection.d.ts"] = true;
libFileSet["lib.es2015.core.d.ts"] = true;
libFileSet["lib.es2015.d.ts"] = true;
libFileSet["lib.es2015.generator.d.ts"] = true;
libFileSet["lib.es2015.iterable.d.ts"] = true;
libFileSet["lib.es2015.promise.d.ts"] = true;
libFileSet["lib.es2015.proxy.d.ts"] = true;
libFileSet["lib.es2015.reflect.d.ts"] = true;
libFileSet["lib.es2015.symbol.d.ts"] = true;
libFileSet["lib.es2015.symbol.wellknown.d.ts"] = true;
libFileSet["lib.es2016.array.include.d.ts"] = true;
libFileSet["lib.es2016.d.ts"] = true;
libFileSet["lib.es2016.full.d.ts"] = true;
libFileSet["lib.es2017.d.ts"] = true;
libFileSet["lib.es2017.full.d.ts"] = true;
libFileSet["lib.es2017.intl.d.ts"] = true;
libFileSet["lib.es2017.object.d.ts"] = true;
libFileSet["lib.es2017.sharedmemory.d.ts"] = true;
libFileSet["lib.es2017.string.d.ts"] = true;
libFileSet["lib.es2017.typedarrays.d.ts"] = true;
libFileSet["lib.es2018.asyncgenerator.d.ts"] = true;
libFileSet["lib.es2018.asynciterable.d.ts"] = true;
libFileSet["lib.es2018.d.ts"] = true;
libFileSet["lib.es2018.full.d.ts"] = true;
libFileSet["lib.es2018.intl.d.ts"] = true;
libFileSet["lib.es2018.promise.d.ts"] = true;
libFileSet["lib.es2018.regexp.d.ts"] = true;
libFileSet["lib.es2019.array.d.ts"] = true;
libFileSet["lib.es2019.d.ts"] = true;
libFileSet["lib.es2019.full.d.ts"] = true;
libFileSet["lib.es2019.object.d.ts"] = true;
libFileSet["lib.es2019.string.d.ts"] = true;
libFileSet["lib.es2019.symbol.d.ts"] = true;
libFileSet["lib.es2020.bigint.d.ts"] = true;
libFileSet["lib.es2020.d.ts"] = true;
libFileSet["lib.es2020.full.d.ts"] = true;
libFileSet["lib.es2020.intl.d.ts"] = true;
libFileSet["lib.es2020.promise.d.ts"] = true;
libFileSet["lib.es2020.sharedmemory.d.ts"] = true;
libFileSet["lib.es2020.string.d.ts"] = true;
libFileSet["lib.es2020.symbol.wellknown.d.ts"] = true;
libFileSet["lib.es2021.d.ts"] = true;
libFileSet["lib.es2021.full.d.ts"] = true;
libFileSet["lib.es2021.promise.d.ts"] = true;
libFileSet["lib.es2021.string.d.ts"] = true;
libFileSet["lib.es2021.weakref.d.ts"] = true;
libFileSet["lib.es5.d.ts"] = true;
libFileSet["lib.es6.d.ts"] = true;
libFileSet["lib.esnext.d.ts"] = true;
libFileSet["lib.esnext.full.d.ts"] = true;
libFileSet["lib.esnext.intl.d.ts"] = true;
libFileSet["lib.esnext.promise.d.ts"] = true;
libFileSet["lib.esnext.string.d.ts"] = true;
libFileSet["lib.esnext.weakref.d.ts"] = true;
libFileSet["lib.scripthost.d.ts"] = true;
libFileSet["lib.webworker.d.ts"] = true;
libFileSet["lib.webworker.importscripts.d.ts"] = true;
libFileSet["lib.webworker.iterable.d.ts"] = true;
var __extends = globalThis && globalThis.__extends || function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __assign = globalThis && globalThis.__assign || function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var __awaiter = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = globalThis && globalThis.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var IndentStyle;
(function(IndentStyle2) {
  IndentStyle2[IndentStyle2["None"] = 0] = "None";
  IndentStyle2[IndentStyle2["Block"] = 1] = "Block";
  IndentStyle2[IndentStyle2["Smart"] = 2] = "Smart";
})(IndentStyle || (IndentStyle = {}));
function flattenDiagnosticMessageText(diag, newLine, indent) {
  if (indent === void 0) {
    indent = 0;
  }
  if (typeof diag === "string") {
    return diag;
  } else if (diag === void 0) {
    return "";
  }
  var result = "";
  if (indent) {
    result += newLine;
    for (var i = 0; i < indent; i++) {
      result += "  ";
    }
  }
  result += diag.messageText;
  indent++;
  if (diag.next) {
    for (var _i = 0, _a = diag.next; _i < _a.length; _i++) {
      var kid = _a[_i];
      result += flattenDiagnosticMessageText(kid, newLine, indent);
    }
  }
  return result;
}
function displayPartsToString(displayParts) {
  if (displayParts) {
    return displayParts.map(function(displayPart) {
      return displayPart.text;
    }).join("");
  }
  return "";
}
var Adapter = function() {
  function Adapter2(_worker) {
    this._worker = _worker;
  }
  Adapter2.prototype._textSpanToRange = function(model, span) {
    var p1 = model.getPositionAt(span.start);
    var p2 = model.getPositionAt(span.start + span.length);
    var startLineNumber = p1.lineNumber, startColumn = p1.column;
    var endLineNumber = p2.lineNumber, endColumn = p2.column;
    return { startLineNumber, startColumn, endLineNumber, endColumn };
  };
  return Adapter2;
}();
var LibFiles = function() {
  function LibFiles2(_worker) {
    this._worker = _worker;
    this._libFiles = {};
    this._hasFetchedLibFiles = false;
    this._fetchLibFilesPromise = null;
  }
  LibFiles2.prototype.isLibFile = function(uri) {
    if (!uri) {
      return false;
    }
    if (uri.path.indexOf("/lib.") === 0) {
      return !!libFileSet[uri.path.slice(1)];
    }
    return false;
  };
  LibFiles2.prototype.getOrCreateModel = function(fileName) {
    var uri = Uri.parse(fileName);
    var model = editor.getModel(uri);
    if (model) {
      return model;
    }
    if (this.isLibFile(uri) && this._hasFetchedLibFiles) {
      return editor.createModel(this._libFiles[uri.path.slice(1)], "typescript", uri);
    }
    var matchedLibFile = typescriptDefaults.getExtraLibs()[fileName];
    if (matchedLibFile) {
      return editor.createModel(matchedLibFile.content, "typescript", uri);
    }
    return null;
  };
  LibFiles2.prototype._containsLibFile = function(uris) {
    for (var _i = 0, uris_1 = uris; _i < uris_1.length; _i++) {
      var uri = uris_1[_i];
      if (this.isLibFile(uri)) {
        return true;
      }
    }
    return false;
  };
  LibFiles2.prototype.fetchLibFilesIfNecessary = function(uris) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (!this._containsLibFile(uris)) {
              return [2];
            }
            return [4, this._fetchLibFiles()];
          case 1:
            _a.sent();
            return [2];
        }
      });
    });
  };
  LibFiles2.prototype._fetchLibFiles = function() {
    var _this = this;
    if (!this._fetchLibFilesPromise) {
      this._fetchLibFilesPromise = this._worker().then(function(w) {
        return w.getLibFiles();
      }).then(function(libFiles) {
        _this._hasFetchedLibFiles = true;
        _this._libFiles = libFiles;
      });
    }
    return this._fetchLibFilesPromise;
  };
  return LibFiles2;
}();
var DiagnosticCategory;
(function(DiagnosticCategory2) {
  DiagnosticCategory2[DiagnosticCategory2["Warning"] = 0] = "Warning";
  DiagnosticCategory2[DiagnosticCategory2["Error"] = 1] = "Error";
  DiagnosticCategory2[DiagnosticCategory2["Suggestion"] = 2] = "Suggestion";
  DiagnosticCategory2[DiagnosticCategory2["Message"] = 3] = "Message";
})(DiagnosticCategory || (DiagnosticCategory = {}));
var DiagnosticsAdapter = function(_super) {
  __extends(DiagnosticsAdapter2, _super);
  function DiagnosticsAdapter2(_libFiles, _defaults, _selector, worker) {
    var _this = _super.call(this, worker) || this;
    _this._libFiles = _libFiles;
    _this._defaults = _defaults;
    _this._selector = _selector;
    _this._disposables = [];
    _this._listener = Object.create(null);
    var onModelAdd = function(model) {
      if (model.getLanguageId() !== _selector) {
        return;
      }
      var maybeValidate = function() {
        var onlyVisible = _this._defaults.getDiagnosticsOptions().onlyVisible;
        if (onlyVisible) {
          if (model.isAttachedToEditor()) {
            _this._doValidate(model);
          }
        } else {
          _this._doValidate(model);
        }
      };
      var handle;
      var changeSubscription = model.onDidChangeContent(function() {
        clearTimeout(handle);
        handle = window.setTimeout(maybeValidate, 500);
      });
      var visibleSubscription = model.onDidChangeAttached(function() {
        var onlyVisible = _this._defaults.getDiagnosticsOptions().onlyVisible;
        if (onlyVisible) {
          if (model.isAttachedToEditor()) {
            maybeValidate();
          } else {
            editor.setModelMarkers(model, _this._selector, []);
          }
        }
      });
      _this._listener[model.uri.toString()] = {
        dispose: function() {
          changeSubscription.dispose();
          visibleSubscription.dispose();
          clearTimeout(handle);
        }
      };
      maybeValidate();
    };
    var onModelRemoved = function(model) {
      editor.setModelMarkers(model, _this._selector, []);
      var key = model.uri.toString();
      if (_this._listener[key]) {
        _this._listener[key].dispose();
        delete _this._listener[key];
      }
    };
    _this._disposables.push(editor.onDidCreateModel(function(model) {
      return onModelAdd(model);
    }));
    _this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
    _this._disposables.push(editor.onDidChangeModelLanguage(function(event) {
      onModelRemoved(event.model);
      onModelAdd(event.model);
    }));
    _this._disposables.push({
      dispose: function() {
        for (var _i = 0, _a = editor.getModels(); _i < _a.length; _i++) {
          var model = _a[_i];
          onModelRemoved(model);
        }
      }
    });
    var recomputeDiagostics = function() {
      for (var _i = 0, _a = editor.getModels(); _i < _a.length; _i++) {
        var model = _a[_i];
        onModelRemoved(model);
        onModelAdd(model);
      }
    };
    _this._disposables.push(_this._defaults.onDidChange(recomputeDiagostics));
    _this._disposables.push(_this._defaults.onDidExtraLibsChange(recomputeDiagostics));
    editor.getModels().forEach(function(model) {
      return onModelAdd(model);
    });
    return _this;
  }
  DiagnosticsAdapter2.prototype.dispose = function() {
    this._disposables.forEach(function(d) {
      return d && d.dispose();
    });
    this._disposables = [];
  };
  DiagnosticsAdapter2.prototype._doValidate = function(model) {
    return __awaiter(this, void 0, void 0, function() {
      var worker, promises, _a, noSyntaxValidation, noSemanticValidation, noSuggestionDiagnostics, allDiagnostics, diagnostics, relatedUris;
      var _this = this;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            return [4, this._worker(model.uri)];
          case 1:
            worker = _b.sent();
            if (model.isDisposed()) {
              return [2];
            }
            promises = [];
            _a = this._defaults.getDiagnosticsOptions(), noSyntaxValidation = _a.noSyntaxValidation, noSemanticValidation = _a.noSemanticValidation, noSuggestionDiagnostics = _a.noSuggestionDiagnostics;
            if (!noSyntaxValidation) {
              promises.push(worker.getSyntacticDiagnostics(model.uri.toString()));
            }
            if (!noSemanticValidation) {
              promises.push(worker.getSemanticDiagnostics(model.uri.toString()));
            }
            if (!noSuggestionDiagnostics) {
              promises.push(worker.getSuggestionDiagnostics(model.uri.toString()));
            }
            return [4, Promise.all(promises)];
          case 2:
            allDiagnostics = _b.sent();
            if (!allDiagnostics || model.isDisposed()) {
              return [2];
            }
            diagnostics = allDiagnostics.reduce(function(p, c) {
              return c.concat(p);
            }, []).filter(function(d) {
              return (_this._defaults.getDiagnosticsOptions().diagnosticCodesToIgnore || []).indexOf(d.code) === -1;
            });
            relatedUris = diagnostics.map(function(d) {
              return d.relatedInformation || [];
            }).reduce(function(p, c) {
              return c.concat(p);
            }, []).map(function(relatedInformation) {
              return relatedInformation.file ? Uri.parse(relatedInformation.file.fileName) : null;
            });
            return [4, this._libFiles.fetchLibFilesIfNecessary(relatedUris)];
          case 3:
            _b.sent();
            if (model.isDisposed()) {
              return [2];
            }
            editor.setModelMarkers(model, this._selector, diagnostics.map(function(d) {
              return _this._convertDiagnostics(model, d);
            }));
            return [2];
        }
      });
    });
  };
  DiagnosticsAdapter2.prototype._convertDiagnostics = function(model, diag) {
    var diagStart = diag.start || 0;
    var diagLength = diag.length || 1;
    var _a = model.getPositionAt(diagStart), startLineNumber = _a.lineNumber, startColumn = _a.column;
    var _b = model.getPositionAt(diagStart + diagLength), endLineNumber = _b.lineNumber, endColumn = _b.column;
    var tags = [];
    if (diag.reportsUnnecessary) {
      tags.push(MarkerTag.Unnecessary);
    }
    if (diag.reportsDeprecated) {
      tags.push(MarkerTag.Deprecated);
    }
    return {
      severity: this._tsDiagnosticCategoryToMarkerSeverity(diag.category),
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: flattenDiagnosticMessageText(diag.messageText, "\n"),
      code: diag.code.toString(),
      tags,
      relatedInformation: this._convertRelatedInformation(model, diag.relatedInformation)
    };
  };
  DiagnosticsAdapter2.prototype._convertRelatedInformation = function(model, relatedInformation) {
    var _this = this;
    if (!relatedInformation) {
      return [];
    }
    var result = [];
    relatedInformation.forEach(function(info) {
      var relatedResource = model;
      if (info.file) {
        relatedResource = _this._libFiles.getOrCreateModel(info.file.fileName);
      }
      if (!relatedResource) {
        return;
      }
      var infoStart = info.start || 0;
      var infoLength = info.length || 1;
      var _a = relatedResource.getPositionAt(infoStart), startLineNumber = _a.lineNumber, startColumn = _a.column;
      var _b = relatedResource.getPositionAt(infoStart + infoLength), endLineNumber = _b.lineNumber, endColumn = _b.column;
      result.push({
        resource: relatedResource.uri,
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
        message: flattenDiagnosticMessageText(info.messageText, "\n")
      });
    });
    return result;
  };
  DiagnosticsAdapter2.prototype._tsDiagnosticCategoryToMarkerSeverity = function(category) {
    switch (category) {
      case DiagnosticCategory.Error:
        return MarkerSeverity.Error;
      case DiagnosticCategory.Message:
        return MarkerSeverity.Info;
      case DiagnosticCategory.Warning:
        return MarkerSeverity.Warning;
      case DiagnosticCategory.Suggestion:
        return MarkerSeverity.Hint;
    }
    return MarkerSeverity.Info;
  };
  return DiagnosticsAdapter2;
}(Adapter);
var SuggestAdapter = function(_super) {
  __extends(SuggestAdapter2, _super);
  function SuggestAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(SuggestAdapter2.prototype, "triggerCharacters", {
    get: function() {
      return ["."];
    },
    enumerable: false,
    configurable: true
  });
  SuggestAdapter2.prototype.provideCompletionItems = function(model, position, _context, token) {
    return __awaiter(this, void 0, void 0, function() {
      var wordInfo, wordRange, resource, offset, worker, info, suggestions;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            wordInfo = model.getWordUntilPosition(position);
            wordRange = new Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getCompletionsAtPosition(resource.toString(), offset)];
          case 2:
            info = _a.sent();
            if (!info || model.isDisposed()) {
              return [2];
            }
            suggestions = info.entries.map(function(entry) {
              var _a2;
              var range = wordRange;
              if (entry.replacementSpan) {
                var p1 = model.getPositionAt(entry.replacementSpan.start);
                var p2 = model.getPositionAt(entry.replacementSpan.start + entry.replacementSpan.length);
                range = new Range(p1.lineNumber, p1.column, p2.lineNumber, p2.column);
              }
              var tags = [];
              if (((_a2 = entry.kindModifiers) === null || _a2 === void 0 ? void 0 : _a2.indexOf("deprecated")) !== -1) {
                tags.push(languages.CompletionItemTag.Deprecated);
              }
              return {
                uri: resource,
                position,
                offset,
                range,
                label: entry.name,
                insertText: entry.name,
                sortText: entry.sortText,
                kind: SuggestAdapter2.convertKind(entry.kind),
                tags
              };
            });
            return [2, {
              suggestions
            }];
        }
      });
    });
  };
  SuggestAdapter2.prototype.resolveCompletionItem = function(item, token) {
    return __awaiter(this, void 0, void 0, function() {
      var myItem, resource, position, offset, worker, details;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            myItem = item;
            resource = myItem.uri;
            position = myItem.position;
            offset = myItem.offset;
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            return [4, worker.getCompletionEntryDetails(resource.toString(), offset, myItem.label)];
          case 2:
            details = _a.sent();
            if (!details) {
              return [2, myItem];
            }
            return [2, {
              uri: resource,
              position,
              label: details.name,
              kind: SuggestAdapter2.convertKind(details.kind),
              detail: displayPartsToString(details.displayParts),
              documentation: {
                value: SuggestAdapter2.createDocumentationString(details)
              }
            }];
        }
      });
    });
  };
  SuggestAdapter2.convertKind = function(kind) {
    switch (kind) {
      case Kind.primitiveType:
      case Kind.keyword:
        return languages.CompletionItemKind.Keyword;
      case Kind.variable:
      case Kind.localVariable:
        return languages.CompletionItemKind.Variable;
      case Kind.memberVariable:
      case Kind.memberGetAccessor:
      case Kind.memberSetAccessor:
        return languages.CompletionItemKind.Field;
      case Kind.function:
      case Kind.memberFunction:
      case Kind.constructSignature:
      case Kind.callSignature:
      case Kind.indexSignature:
        return languages.CompletionItemKind.Function;
      case Kind.enum:
        return languages.CompletionItemKind.Enum;
      case Kind.module:
        return languages.CompletionItemKind.Module;
      case Kind.class:
        return languages.CompletionItemKind.Class;
      case Kind.interface:
        return languages.CompletionItemKind.Interface;
      case Kind.warning:
        return languages.CompletionItemKind.File;
    }
    return languages.CompletionItemKind.Property;
  };
  SuggestAdapter2.createDocumentationString = function(details) {
    var documentationString = displayPartsToString(details.documentation);
    if (details.tags) {
      for (var _i = 0, _a = details.tags; _i < _a.length; _i++) {
        var tag = _a[_i];
        documentationString += "\n\n" + tagToString(tag);
      }
    }
    return documentationString;
  };
  return SuggestAdapter2;
}(Adapter);
function tagToString(tag) {
  var tagLabel = "*@" + tag.name + "*";
  if (tag.name === "param" && tag.text) {
    var _a = tag.text, paramName = _a[0], rest = _a.slice(1);
    tagLabel += "`" + paramName.text + "`";
    if (rest.length > 0)
      tagLabel += " \u2014 " + rest.map(function(r) {
        return r.text;
      }).join(" ");
  } else if (Array.isArray(tag.text)) {
    tagLabel += " \u2014 " + tag.text.map(function(r) {
      return r.text;
    }).join(" ");
  } else if (tag.text) {
    tagLabel += " \u2014 " + tag.text;
  }
  return tagLabel;
}
var SignatureHelpAdapter = function(_super) {
  __extends(SignatureHelpAdapter2, _super);
  function SignatureHelpAdapter2() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.signatureHelpTriggerCharacters = ["(", ","];
    return _this;
  }
  SignatureHelpAdapter2._toSignatureHelpTriggerReason = function(context) {
    switch (context.triggerKind) {
      case languages.SignatureHelpTriggerKind.TriggerCharacter:
        if (context.triggerCharacter) {
          if (context.isRetrigger) {
            return { kind: "retrigger", triggerCharacter: context.triggerCharacter };
          } else {
            return { kind: "characterTyped", triggerCharacter: context.triggerCharacter };
          }
        } else {
          return { kind: "invoked" };
        }
      case languages.SignatureHelpTriggerKind.ContentChange:
        return context.isRetrigger ? { kind: "retrigger" } : { kind: "invoked" };
      case languages.SignatureHelpTriggerKind.Invoke:
      default:
        return { kind: "invoked" };
    }
  };
  SignatureHelpAdapter2.prototype.provideSignatureHelp = function(model, position, token, context) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, offset, worker, info, ret;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getSignatureHelpItems(resource.toString(), offset, {
              triggerReason: SignatureHelpAdapter2._toSignatureHelpTriggerReason(context)
            })];
          case 2:
            info = _a.sent();
            if (!info || model.isDisposed()) {
              return [2];
            }
            ret = {
              activeSignature: info.selectedItemIndex,
              activeParameter: info.argumentIndex,
              signatures: []
            };
            info.items.forEach(function(item) {
              var signature = {
                label: "",
                parameters: []
              };
              signature.documentation = {
                value: displayPartsToString(item.documentation)
              };
              signature.label += displayPartsToString(item.prefixDisplayParts);
              item.parameters.forEach(function(p, i, a) {
                var label = displayPartsToString(p.displayParts);
                var parameter = {
                  label,
                  documentation: {
                    value: displayPartsToString(p.documentation)
                  }
                };
                signature.label += label;
                signature.parameters.push(parameter);
                if (i < a.length - 1) {
                  signature.label += displayPartsToString(item.separatorDisplayParts);
                }
              });
              signature.label += displayPartsToString(item.suffixDisplayParts);
              ret.signatures.push(signature);
            });
            return [2, {
              value: ret,
              dispose: function() {
              }
            }];
        }
      });
    });
  };
  return SignatureHelpAdapter2;
}(Adapter);
var QuickInfoAdapter = function(_super) {
  __extends(QuickInfoAdapter2, _super);
  function QuickInfoAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  QuickInfoAdapter2.prototype.provideHover = function(model, position, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, offset, worker, info, documentation, tags, contents;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getQuickInfoAtPosition(resource.toString(), offset)];
          case 2:
            info = _a.sent();
            if (!info || model.isDisposed()) {
              return [2];
            }
            documentation = displayPartsToString(info.documentation);
            tags = info.tags ? info.tags.map(function(tag) {
              return tagToString(tag);
            }).join("  \n\n") : "";
            contents = displayPartsToString(info.displayParts);
            return [2, {
              range: this._textSpanToRange(model, info.textSpan),
              contents: [
                {
                  value: "```typescript\n" + contents + "\n```\n"
                },
                {
                  value: documentation + (tags ? "\n\n" + tags : "")
                }
              ]
            }];
        }
      });
    });
  };
  return QuickInfoAdapter2;
}(Adapter);
var OccurrencesAdapter = function(_super) {
  __extends(OccurrencesAdapter2, _super);
  function OccurrencesAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  OccurrencesAdapter2.prototype.provideDocumentHighlights = function(model, position, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, offset, worker, entries;
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getOccurrencesAtPosition(resource.toString(), offset)];
          case 2:
            entries = _a.sent();
            if (!entries || model.isDisposed()) {
              return [2];
            }
            return [2, entries.map(function(entry) {
              return {
                range: _this._textSpanToRange(model, entry.textSpan),
                kind: entry.isWriteAccess ? languages.DocumentHighlightKind.Write : languages.DocumentHighlightKind.Text
              };
            })];
        }
      });
    });
  };
  return OccurrencesAdapter2;
}(Adapter);
var DefinitionAdapter = function(_super) {
  __extends(DefinitionAdapter2, _super);
  function DefinitionAdapter2(_libFiles, worker) {
    var _this = _super.call(this, worker) || this;
    _this._libFiles = _libFiles;
    return _this;
  }
  DefinitionAdapter2.prototype.provideDefinition = function(model, position, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, offset, worker, entries, result, _i, entries_1, entry, refModel;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getDefinitionAtPosition(resource.toString(), offset)];
          case 2:
            entries = _a.sent();
            if (!entries || model.isDisposed()) {
              return [2];
            }
            return [4, this._libFiles.fetchLibFilesIfNecessary(entries.map(function(entry2) {
              return Uri.parse(entry2.fileName);
            }))];
          case 3:
            _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            result = [];
            for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
              entry = entries_1[_i];
              refModel = this._libFiles.getOrCreateModel(entry.fileName);
              if (refModel) {
                result.push({
                  uri: refModel.uri,
                  range: this._textSpanToRange(refModel, entry.textSpan)
                });
              }
            }
            return [2, result];
        }
      });
    });
  };
  return DefinitionAdapter2;
}(Adapter);
var ReferenceAdapter = function(_super) {
  __extends(ReferenceAdapter2, _super);
  function ReferenceAdapter2(_libFiles, worker) {
    var _this = _super.call(this, worker) || this;
    _this._libFiles = _libFiles;
    return _this;
  }
  ReferenceAdapter2.prototype.provideReferences = function(model, position, context, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, offset, worker, entries, result, _i, entries_2, entry, refModel;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getReferencesAtPosition(resource.toString(), offset)];
          case 2:
            entries = _a.sent();
            if (!entries || model.isDisposed()) {
              return [2];
            }
            return [4, this._libFiles.fetchLibFilesIfNecessary(entries.map(function(entry2) {
              return Uri.parse(entry2.fileName);
            }))];
          case 3:
            _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            result = [];
            for (_i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
              entry = entries_2[_i];
              refModel = this._libFiles.getOrCreateModel(entry.fileName);
              if (refModel) {
                result.push({
                  uri: refModel.uri,
                  range: this._textSpanToRange(refModel, entry.textSpan)
                });
              }
            }
            return [2, result];
        }
      });
    });
  };
  return ReferenceAdapter2;
}(Adapter);
var OutlineAdapter = function(_super) {
  __extends(OutlineAdapter2, _super);
  function OutlineAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  OutlineAdapter2.prototype.provideDocumentSymbols = function(model, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, worker, items, convert, result;
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getNavigationBarItems(resource.toString())];
          case 2:
            items = _a.sent();
            if (!items || model.isDisposed()) {
              return [2];
            }
            convert = function(bucket, item, containerLabel) {
              var result2 = {
                name: item.text,
                detail: "",
                kind: outlineTypeTable[item.kind] || languages.SymbolKind.Variable,
                range: _this._textSpanToRange(model, item.spans[0]),
                selectionRange: _this._textSpanToRange(model, item.spans[0]),
                tags: []
              };
              if (containerLabel)
                result2.containerName = containerLabel;
              if (item.childItems && item.childItems.length > 0) {
                for (var _i = 0, _a2 = item.childItems; _i < _a2.length; _i++) {
                  var child = _a2[_i];
                  convert(bucket, child, result2.name);
                }
              }
              bucket.push(result2);
            };
            result = [];
            items.forEach(function(item) {
              return convert(result, item);
            });
            return [2, result];
        }
      });
    });
  };
  return OutlineAdapter2;
}(Adapter);
var Kind = function() {
  function Kind2() {
  }
  Kind2.unknown = "";
  Kind2.keyword = "keyword";
  Kind2.script = "script";
  Kind2.module = "module";
  Kind2.class = "class";
  Kind2.interface = "interface";
  Kind2.type = "type";
  Kind2.enum = "enum";
  Kind2.variable = "var";
  Kind2.localVariable = "local var";
  Kind2.function = "function";
  Kind2.localFunction = "local function";
  Kind2.memberFunction = "method";
  Kind2.memberGetAccessor = "getter";
  Kind2.memberSetAccessor = "setter";
  Kind2.memberVariable = "property";
  Kind2.constructorImplementation = "constructor";
  Kind2.callSignature = "call";
  Kind2.indexSignature = "index";
  Kind2.constructSignature = "construct";
  Kind2.parameter = "parameter";
  Kind2.typeParameter = "type parameter";
  Kind2.primitiveType = "primitive type";
  Kind2.label = "label";
  Kind2.alias = "alias";
  Kind2.const = "const";
  Kind2.let = "let";
  Kind2.warning = "warning";
  return Kind2;
}();
var outlineTypeTable = Object.create(null);
outlineTypeTable[Kind.module] = languages.SymbolKind.Module;
outlineTypeTable[Kind.class] = languages.SymbolKind.Class;
outlineTypeTable[Kind.enum] = languages.SymbolKind.Enum;
outlineTypeTable[Kind.interface] = languages.SymbolKind.Interface;
outlineTypeTable[Kind.memberFunction] = languages.SymbolKind.Method;
outlineTypeTable[Kind.memberVariable] = languages.SymbolKind.Property;
outlineTypeTable[Kind.memberGetAccessor] = languages.SymbolKind.Property;
outlineTypeTable[Kind.memberSetAccessor] = languages.SymbolKind.Property;
outlineTypeTable[Kind.variable] = languages.SymbolKind.Variable;
outlineTypeTable[Kind.const] = languages.SymbolKind.Variable;
outlineTypeTable[Kind.localVariable] = languages.SymbolKind.Variable;
outlineTypeTable[Kind.variable] = languages.SymbolKind.Variable;
outlineTypeTable[Kind.function] = languages.SymbolKind.Function;
outlineTypeTable[Kind.localFunction] = languages.SymbolKind.Function;
var FormatHelper = function(_super) {
  __extends(FormatHelper2, _super);
  function FormatHelper2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  FormatHelper2._convertOptions = function(options) {
    return {
      ConvertTabsToSpaces: options.insertSpaces,
      TabSize: options.tabSize,
      IndentSize: options.tabSize,
      IndentStyle: IndentStyle.Smart,
      NewLineCharacter: "\n",
      InsertSpaceAfterCommaDelimiter: true,
      InsertSpaceAfterSemicolonInForStatements: true,
      InsertSpaceBeforeAndAfterBinaryOperators: true,
      InsertSpaceAfterKeywordsInControlFlowStatements: true,
      InsertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
      InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
      InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
      InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
      PlaceOpenBraceOnNewLineForControlBlocks: false,
      PlaceOpenBraceOnNewLineForFunctions: false
    };
  };
  FormatHelper2.prototype._convertTextChanges = function(model, change) {
    return {
      text: change.newText,
      range: this._textSpanToRange(model, change.span)
    };
  };
  return FormatHelper2;
}(Adapter);
var FormatAdapter = function(_super) {
  __extends(FormatAdapter2, _super);
  function FormatAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  FormatAdapter2.prototype.provideDocumentRangeFormattingEdits = function(model, range, options, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, startOffset, endOffset, worker, edits;
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            startOffset = model.getOffsetAt({
              lineNumber: range.startLineNumber,
              column: range.startColumn
            });
            endOffset = model.getOffsetAt({
              lineNumber: range.endLineNumber,
              column: range.endColumn
            });
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getFormattingEditsForRange(resource.toString(), startOffset, endOffset, FormatHelper._convertOptions(options))];
          case 2:
            edits = _a.sent();
            if (!edits || model.isDisposed()) {
              return [2];
            }
            return [2, edits.map(function(edit) {
              return _this._convertTextChanges(model, edit);
            })];
        }
      });
    });
  };
  return FormatAdapter2;
}(FormatHelper);
var FormatOnTypeAdapter = function(_super) {
  __extends(FormatOnTypeAdapter2, _super);
  function FormatOnTypeAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(FormatOnTypeAdapter2.prototype, "autoFormatTriggerCharacters", {
    get: function() {
      return [";", "}", "\n"];
    },
    enumerable: false,
    configurable: true
  });
  FormatOnTypeAdapter2.prototype.provideOnTypeFormattingEdits = function(model, position, ch, options, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, offset, worker, edits;
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getFormattingEditsAfterKeystroke(resource.toString(), offset, ch, FormatHelper._convertOptions(options))];
          case 2:
            edits = _a.sent();
            if (!edits || model.isDisposed()) {
              return [2];
            }
            return [2, edits.map(function(edit) {
              return _this._convertTextChanges(model, edit);
            })];
        }
      });
    });
  };
  return FormatOnTypeAdapter2;
}(FormatHelper);
var CodeActionAdaptor = function(_super) {
  __extends(CodeActionAdaptor2, _super);
  function CodeActionAdaptor2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  CodeActionAdaptor2.prototype.provideCodeActions = function(model, range, context, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, start, end, formatOptions, errorCodes, worker, codeFixes, actions;
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            start = model.getOffsetAt({
              lineNumber: range.startLineNumber,
              column: range.startColumn
            });
            end = model.getOffsetAt({
              lineNumber: range.endLineNumber,
              column: range.endColumn
            });
            formatOptions = FormatHelper._convertOptions(model.getOptions());
            errorCodes = context.markers.filter(function(m) {
              return m.code;
            }).map(function(m) {
              return m.code;
            }).map(Number);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getCodeFixesAtPosition(resource.toString(), start, end, errorCodes, formatOptions)];
          case 2:
            codeFixes = _a.sent();
            if (!codeFixes || model.isDisposed()) {
              return [2, { actions: [], dispose: function() {
              } }];
            }
            actions = codeFixes.filter(function(fix) {
              return fix.changes.filter(function(change) {
                return change.isNewFile;
              }).length === 0;
            }).map(function(fix) {
              return _this._tsCodeFixActionToMonacoCodeAction(model, context, fix);
            });
            return [2, {
              actions,
              dispose: function() {
              }
            }];
        }
      });
    });
  };
  CodeActionAdaptor2.prototype._tsCodeFixActionToMonacoCodeAction = function(model, context, codeFix) {
    var edits = [];
    for (var _i = 0, _a = codeFix.changes; _i < _a.length; _i++) {
      var change = _a[_i];
      for (var _b = 0, _c = change.textChanges; _b < _c.length; _b++) {
        var textChange = _c[_b];
        edits.push({
          resource: model.uri,
          edit: {
            range: this._textSpanToRange(model, textChange.span),
            text: textChange.newText
          }
        });
      }
    }
    var action = {
      title: codeFix.description,
      edit: { edits },
      diagnostics: context.markers,
      kind: "quickfix"
    };
    return action;
  };
  return CodeActionAdaptor2;
}(FormatHelper);
var RenameAdapter = function(_super) {
  __extends(RenameAdapter2, _super);
  function RenameAdapter2(_libFiles, worker) {
    var _this = _super.call(this, worker) || this;
    _this._libFiles = _libFiles;
    return _this;
  }
  RenameAdapter2.prototype.provideRenameEdits = function(model, position, newName, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, fileName, offset, worker, renameInfo, renameLocations, edits, _i, renameLocations_1, renameLocation, model_1;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            fileName = resource.toString();
            offset = model.getOffsetAt(position);
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2];
            }
            return [4, worker.getRenameInfo(fileName, offset, {
              allowRenameOfImportPath: false
            })];
          case 2:
            renameInfo = _a.sent();
            if (renameInfo.canRename === false) {
              return [2, {
                edits: [],
                rejectReason: renameInfo.localizedErrorMessage
              }];
            }
            if (renameInfo.fileToRename !== void 0) {
              throw new Error("Renaming files is not supported.");
            }
            return [4, worker.findRenameLocations(fileName, offset, false, false, false)];
          case 3:
            renameLocations = _a.sent();
            if (!renameLocations || model.isDisposed()) {
              return [2];
            }
            edits = [];
            for (_i = 0, renameLocations_1 = renameLocations; _i < renameLocations_1.length; _i++) {
              renameLocation = renameLocations_1[_i];
              model_1 = this._libFiles.getOrCreateModel(renameLocation.fileName);
              if (model_1) {
                edits.push({
                  resource: model_1.uri,
                  edit: {
                    range: this._textSpanToRange(model_1, renameLocation.textSpan),
                    text: newName
                  }
                });
              } else {
                throw new Error("Unknown file " + renameLocation.fileName + ".");
              }
            }
            return [2, { edits }];
        }
      });
    });
  };
  return RenameAdapter2;
}(Adapter);
var InlayHintsAdapter = function(_super) {
  __extends(InlayHintsAdapter2, _super);
  function InlayHintsAdapter2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  InlayHintsAdapter2.prototype.provideInlayHints = function(model, range, token) {
    return __awaiter(this, void 0, void 0, function() {
      var resource, fileName, start, end, worker, hints;
      var _this = this;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            resource = model.uri;
            fileName = resource.toString();
            start = model.getOffsetAt({
              lineNumber: range.startLineNumber,
              column: range.startColumn
            });
            end = model.getOffsetAt({
              lineNumber: range.endLineNumber,
              column: range.endColumn
            });
            return [4, this._worker(resource)];
          case 1:
            worker = _a.sent();
            if (model.isDisposed()) {
              return [2, []];
            }
            return [4, worker.provideInlayHints(fileName, start, end)];
          case 2:
            hints = _a.sent();
            return [2, hints.map(function(hint) {
              return __assign(__assign({}, hint), { position: model.getPositionAt(hint.position), kind: _this._convertHintKind(hint.kind) });
            })];
        }
      });
    });
  };
  InlayHintsAdapter2.prototype._convertHintKind = function(kind) {
    switch (kind) {
      case "Parameter":
        return languages.InlayHintKind.Parameter;
      case "Type":
        return languages.InlayHintKind.Type;
      default:
        return languages.InlayHintKind.Other;
    }
  };
  return InlayHintsAdapter2;
}(Adapter);
var javaScriptWorker;
var typeScriptWorker;
function setupTypeScript(defaults) {
  typeScriptWorker = setupMode(defaults, "typescript");
}
function setupJavaScript(defaults) {
  javaScriptWorker = setupMode(defaults, "javascript");
}
function getJavaScriptWorker() {
  return new Promise(function(resolve, reject) {
    if (!javaScriptWorker) {
      return reject("JavaScript not registered!");
    }
    resolve(javaScriptWorker);
  });
}
function getTypeScriptWorker() {
  return new Promise(function(resolve, reject) {
    if (!typeScriptWorker) {
      return reject("TypeScript not registered!");
    }
    resolve(typeScriptWorker);
  });
}
function setupMode(defaults, modeId) {
  var client = new WorkerManager(modeId, defaults);
  var worker = function() {
    var uris = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      uris[_i] = arguments[_i];
    }
    return client.getLanguageServiceWorker.apply(client, uris);
  };
  var libFiles = new LibFiles(worker);
  languages.registerCompletionItemProvider(modeId, new SuggestAdapter(worker));
  languages.registerSignatureHelpProvider(modeId, new SignatureHelpAdapter(worker));
  languages.registerHoverProvider(modeId, new QuickInfoAdapter(worker));
  languages.registerDocumentHighlightProvider(modeId, new OccurrencesAdapter(worker));
  languages.registerDefinitionProvider(modeId, new DefinitionAdapter(libFiles, worker));
  languages.registerReferenceProvider(modeId, new ReferenceAdapter(libFiles, worker));
  languages.registerDocumentSymbolProvider(modeId, new OutlineAdapter(worker));
  languages.registerDocumentRangeFormattingEditProvider(modeId, new FormatAdapter(worker));
  languages.registerOnTypeFormattingEditProvider(modeId, new FormatOnTypeAdapter(worker));
  languages.registerCodeActionProvider(modeId, new CodeActionAdaptor(worker));
  languages.registerRenameProvider(modeId, new RenameAdapter(libFiles, worker));
  languages.registerInlayHintsProvider(modeId, new InlayHintsAdapter(worker));
  new DiagnosticsAdapter(libFiles, defaults, modeId, worker);
  return worker;
}
export { getJavaScriptWorker, getTypeScriptWorker, setupJavaScript, setupTypeScript };
