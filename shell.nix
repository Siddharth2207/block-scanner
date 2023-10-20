let
    pkgs = import
        (builtins.fetchTarball {
            name = "nixos-unstable-2022-09-26";
            url = "https://github.com/nixos/nixpkgs/archive/b8e83fd7e16529ee331313993508c3bf918f1d57.tar.gz";
            sha256 = "1a98pgnhdhyg66176i36rcn3rklihy36y9z4176la7pxlzm4khwf";
        })
        { };


    flush = pkgs.writeShellScriptBin "flush" ''
        rm -rf node_modules
    '';

    ci-build = pkgs.writeShellScriptBin "ci-build" ''
        flush
        npm install
    '';

    docgen = pkgs.writeShellScriptBin "docgen" ''
        npm run docgen
    '';

    lint = pkgs.writeShellScriptBin "lint" ''
        npm run lint
    '';

    lint-fix = pkgs.writeShellScriptBin "lint-fix" ''
        npm run lint-fix
    '';

    in
    pkgs.stdenv.mkDerivation {
        name = "shell";
        buildInputs = [
            pkgs.watch
            pkgs.nixpkgs-fmt
            pkgs.nodejs-18_x
            pkgs.libuuid
            ci-build
            flush
            docgen
            lint
            lint-fix
        ];
        APPEND_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.libuuid ]}";
        shellHook = ''
            export LD_LIBRARY_PATH="$APPEND_LIBRARY_PATH:$LD_LIBRARY_PATH"
            export PATH=$( npm bin ):$PATH
            # keep it fresh
            npm install
        '';
    }
