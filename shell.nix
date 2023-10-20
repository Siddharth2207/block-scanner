let
    pkgs = import
        (builtins.fetchTarball {
            name = "nixos-unstable-2023-10-20";
            url = "https://github.com/nixos/nixpkgs/archive/1542bb6ef545ec47a35907d7fb293e4f31514a38.tar.gz";
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
            pkgs.nodejs_20
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
